import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import path from 'path';
import os from 'os';

// 这是一个后端代理，用于处理S3文件上传，绕过浏览器的CORS限制
// 在生产环境中，您应该使用适当的S3 SDK或fetch客户端
// 这里我们使用一个简化的实现，仅用于开发/演示

export async function POST(request: NextRequest) {
  try {
    // 解析multipart/form-data
    const formData = await request.formData();
    
    // 获取文件和预签名数据
    const file = formData.get('file') as File;
    const presignedDataStr = formData.get('presignedData') as string;
    
    if (!file || !presignedDataStr) {
      return NextResponse.json(
        { error: 'Missing file or presigned data' },
        { status: 400 }
      );
    }
    
    // 解析预签名数据
    const presignedData = JSON.parse(presignedDataStr);
    
    console.log('Proxy received file:', file.name, file.size, file.type);
    console.log('Proxy received presigned data:', presignedData);
    
    // 模拟上传过程
    try {
      // 1. 创建一个新的FormData对象用于上传到S3
      const s3FormData = new FormData();
      
      // 2. 添加所有S3需要的字段
      Object.entries(presignedData.fields).forEach(([key, value]: [string, any]) => {
        s3FormData.append(key, value);
      });
      
      // 3. 添加文件
      s3FormData.append('file', file);
      
      // 4. 使用fetch进行POST请求到S3
      // 注意：Node.js环境中的fetch不受浏览器CORS限制
      const response = await fetch(presignedData.url, {
        method: 'POST',
        body: s3FormData,
      });
      
      if (!response.ok) {
        // 如果上传失败，记录错误并抛出异常
        const responseText = await response.text();
        console.error('S3 upload failed via proxy:', responseText);
        throw new Error(`S3 upload failed with status: ${response.status}`);
      }
      
      // 上传成功，返回文件URL
      const baseUrl = process.env.NEXT_PUBLIC_S3_BASE_URL || 'https://property-agent-uploads.s3.ap-northeast-1.amazonaws.com';
      const fileUrl = `${baseUrl}/${presignedData.image_key}`;
      
      return NextResponse.json({
        success: true,
        message: 'File uploaded successfully via proxy',
        fileUrl,
      });
      
    } catch (uploadError) {
      console.error('Error in proxy upload to S3:', uploadError);
      
      // 如果S3上传失败，我们可以选择在本地保存文件作为后备方案
      // 注意：在生产环境中，您可能需要更复杂的错误处理策略
      const tempDir = join(os.tmpdir(), 'feedback-uploads');
      await mkdir(tempDir, { recursive: true });
      
      const fileExtension = path.extname(file.name) || '.jpg';
      const localFileName = `${Date.now()}${fileExtension}`;
      const localFilePath = join(tempDir, localFileName);
      
      // 保存文件到本地临时目录
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      await writeFile(localFilePath, fileBuffer);
      
      // 创建一个公共可访问的路径
      const publicDir = join(process.cwd(), 'public', 'uploads', 'feedback');
      await mkdir(publicDir, { recursive: true });
      const publicPath = join(publicDir, localFileName);
      await writeFile(publicPath, fileBuffer);
      
      // 返回本地文件URL
      return NextResponse.json({
        success: true,
        message: 'File saved locally as fallback',
        fileUrl: `/uploads/feedback/${localFileName}`,
      });
    }
    
  } catch (error) {
    console.error('Error in upload proxy:', error);
    return NextResponse.json(
      { error: 'Failed to process file upload via proxy' },
      { status: 500 }
    );
  }
} 