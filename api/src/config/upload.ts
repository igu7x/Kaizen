/**
 * Configuração do Multer para upload de arquivos
 */
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Diretório base para uploads
const UPLOAD_BASE_DIR = path.join(__dirname, '..', '..', 'uploads');

// Configurar armazenamento para atas de reunião
const ataStorage = multer.diskStorage({
    destination: (req: Request, file, cb) => {
        // Extrair informações da requisição
        const sigla = (req.params.sigla || 'geral').toLowerCase().replace(/[^a-z0-9-]/g, '-');
        const ano = req.body.ano || new Date().getFullYear();
        
        // Criar caminho dinâmico: uploads/comites/atas/{sigla}/{ano}
        const uploadPath = path.join(UPLOAD_BASE_DIR, 'comites', 'atas', sigla, String(ano));
        
        // Criar diretórios se não existirem
        fs.mkdirSync(uploadPath, { recursive: true });
        
        cb(null, uploadPath);
    },
    
    filename: (req: Request, file, cb) => {
        // Gerar nome único para o arquivo
        const numero = req.body.numero || 0;
        const ano = req.body.ano || new Date().getFullYear();
        const timestamp = Date.now();
        
        // Formato: ata-reuniao-{numero}-{ano}-{timestamp}.pdf
        const filename = `ata-reuniao-${numero}-${ano}-${timestamp}.pdf`;
        
        cb(null, filename);
    }
});

// Filtro para aceitar apenas PDFs
const pdfFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Aceitar apenas arquivos PDF
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Apenas arquivos PDF são permitidos'));
    }
};

// Configurar multer para upload de atas
export const uploadAta = multer({
    storage: ataStorage,
    fileFilter: pdfFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB máximo
    }
});

// Função para deletar arquivo
export const deleteFile = (filepath: string): boolean => {
    try {
        if (filepath && fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
            console.log('📁 Arquivo deletado:', filepath);
            return true;
        }
        return false;
    } catch (error) {
        console.error('❌ Erro ao deletar arquivo:', error);
        return false;
    }
};

// Função para verificar se arquivo existe
export const fileExists = (filepath: string): boolean => {
    return filepath ? fs.existsSync(filepath) : false;
};

// Obter caminho absoluto do arquivo
export const getAbsolutePath = (filepath: string): string => {
    return path.resolve(filepath);
};

export default uploadAta;





















