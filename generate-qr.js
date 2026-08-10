import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const products = [
  'GROW',
  'BLACK KICK',
  'SMART GROW',
  'FINE',
  'SOIL GOLD',
  'SKIP',
  'SOIL SUPER',
  'NEXT',
  'FRIEND',
  'MERACO'
];

const dir = path.join(process.cwd(), 'qrcods2');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

const generatePDF = async (product) => {
  const slug = product.replace(/ /g, '-');
  const url = `https://suchang.vercel.app/${slug}`;
  
  try {
    const qrDataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2 });
    const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, "");
    const imgBuffer = Buffer.from(base64Data, 'base64');

    const doc = new PDFDocument({ size: 'A4' });
    const pdfPath = path.join(dir, `${product}.pdf`);
    doc.pipe(fs.createWriteStream(pdfPath));

    // Move down a bit before title
    doc.moveDown(4);
    doc.fontSize(30).text(product, { align: 'center' });
    doc.moveDown(2);
    
    // Add image centered
    const imgWidth = 300;
    const x = (doc.page.width - imgWidth) / 2;
    doc.image(imgBuffer, x, doc.y, { width: imgWidth });
    
    // Also add the url below
    doc.moveDown(12);
    doc.fontSize(12).fillColor('blue').text(url, { align: 'center', link: url });

    doc.end();
    console.log(`Created PDF for ${product} at ${pdfPath}`);
  } catch (err) {
    console.error(`Error for ${product}:`, err);
  }
};

async function main() {
  console.log('Generating QR code PDFs...');
  for (const product of products) {
    await generatePDF(product);
  }
  console.log('Done!');
}

main();
