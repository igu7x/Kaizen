import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { testConnection } from './config/database.js';

// Importar rotas
import usersRouter from './routes/users.js';
import okrRouter from './routes/okr.js';
import authRouter from './routes/auth.js';
import formsRouter from './routes/forms.js';
import pcaRouter from './routes/pca.js';
import pcaDetailsRouter from './routes/pca-details.js';
import pcaRenovacoesRouter from './routes/pca-renovacoes.js';
import pcaRenovacoesDetailsRouter from './routes/pca-renovacoes-details.js';
import comitesRouter from './routes/comites.js';
import colaboradoresRouter from './routes/colaboradores.js';
import permissoesRouter from './routes/permissoes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente do .env APENAS se não estiverem definidas no sistema
// Em produção (OpenShift), as variáveis do deployment têm precedência
dotenv.config({ path: path.join(__dirname, '..', '.env'), override: false });

const app = express();
// Porta 8080 é o padrão esperado pelo OpenShift
const PORT = process.env.PORT || 8080;

// ============================================================
// MIDDLEWARE
// ============================================================

// Configuração do CORS - aceita múltiplas origens
const allowedOrigins = [
    // Desenvolvimento local
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:3000',
    // Staging (OpenShift)
    'https://painel-sgjt-stag-frontend.apps.ocp-prd.tjgo.jus.br',
    'http://painel-sgjt-stag-frontend.apps.ocp-prd.tjgo.jus.br',
    // Produção (OpenShift interno)
    'https://painel-sgjt-prd-frontend.apps.ocp-prd.tjgo.jus.br',
    'http://painel-sgjt-prd-frontend.apps.ocp-prd.tjgo.jus.br',
    // Produção (Kaizen - domínio público)
    'https://kaizen.tjgo.jus.br',
    'http://kaizen.tjgo.jus.br',
    // Variável de ambiente adicional (se definida)
    process.env.CORS_ORIGIN,
].filter(Boolean) as string[];

console.log('🌐 CORS - Origens permitidas:', allowedOrigins);

// ⚠️ MIDDLEWARE CORS MANUAL - Adiciona headers antes de qualquer coisa
// Necessário para OpenShift/proxies que podem interceptar requisições
app.use((req, res, next) => {
    const origin = req.headers.origin;
    
    // Se a origem está na lista permitida, adiciona o header
    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (!origin) {
        // Para requisições sem origin (Postman, curl, etc)
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-User-Role, X-User-Id');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
    
    // Responde imediatamente para requisições OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        console.log(`✅ CORS Preflight: ${origin} -> ${req.path}`);
        return res.status(200).end();
    }
    
    next();
});

// Middleware cors como backup
app.use(cors({
    origin: true, // Permite todas as origens (headers já foram definidos acima)
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (uploads)
// Determinar o diretório raiz do projeto (funciona tanto em dev quanto em prod)
const projectRoot = path.resolve(__dirname, '..');
const uploadsPath = path.join(projectRoot, 'uploads');

// Criar pasta de uploads se não existir
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log('📁 Pasta de uploads criada:', uploadsPath);
}
if (!fs.existsSync(path.join(uploadsPath, 'gestores'))) {
    fs.mkdirSync(path.join(uploadsPath, 'gestores'), { recursive: true });
    console.log('📁 Pasta de uploads/gestores criada');
}

console.log('📁 Servindo uploads de:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));

// Logging middleware (desenvolvimento)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// ============================================================
// ROTAS
// ============================================================

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API Info
app.get('/api', (req, res) => {
    res.json({
        name: 'Plataforma de Gestão API',
        version: '1.0.0',
        description: 'API PostgreSQL para OKR + Formulários Dinâmicos + Contratações TI',
        endpoints: {
            health: '/health',
            auth: {
                login: 'POST /api/auth/login',
                logout: 'POST /api/auth/logout',
            },
            users: '/api/users',
            objectives: '/api/objectives',
            keyResults: '/api/key-results',
            initiatives: '/api/initiatives',
            programs: '/api/programs',
            directorates: '/api/directorates',
            forms: '/api/forms',
            pcaItems: {
                list: 'GET /api/pca-items',
                get: 'GET /api/pca-items/:id',
                stats: 'GET /api/pca-items/stats',
                filters: 'GET /api/pca-items/filters',
                create: 'POST /api/pca-items',
                update: 'PUT /api/pca-items/:id',
                updateStatus: 'PATCH /api/pca-items/:id/status',
                delete: 'DELETE /api/pca-items/:id',
            },
        }
    });
});

// Usar rotas
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/forms', formsRouter);
app.use('/api/pca-items', pcaRouter);
app.use('/api/pca-items', pcaDetailsRouter);
app.use('/api/pca-renovacoes', pcaRenovacoesRouter);
app.use('/api/pca-renovacoes-details', pcaRenovacoesDetailsRouter);
app.use('/api/comites', comitesRouter);
app.use('/api/colaboradores', colaboradoresRouter);
app.use('/api/permissoes', permissoesRouter);
app.use('/api', okrRouter);

// ============================================================
// ERROR HANDLING
// ============================================================

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
        available: '/api'
    });
});

// Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);

    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ============================================================
// START SERVER
// ============================================================

async function startServer() {
    try {
        // Testar conexão com banco
        console.log('Testando conexão com PostgreSQL...');
        const connected = await testConnection();

        if (!connected) {
            console.error('\n❌ Não foi possível conectar ao PostgreSQL');
            console.error('Verifique as configurações no arquivo .env\n');
            process.exit(1);
        }

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log('');
            console.log('='.repeat(60));
            console.log('  🚀 SERVIDOR INICIADO COM SUCESSO!');
            console.log('='.repeat(60));
            console.log('');
            console.log(`  Ambiente: ${process.env.NODE_ENV || 'development'}`);
            console.log(`  Porta: ${PORT}`);
            console.log(`  URL: http://localhost:${PORT}`);
            console.log(`  API Info: http://localhost:${PORT}/api`);
            console.log(`  Health Check: http://localhost:${PORT}/health`);
            console.log('');
            console.log('  🔗 ROTAS IMPLEMENTADAS:');
            console.log('     - POST /api/auth/login');
            console.log('     - GET  /api/users');
            console.log('     - POST /api/users');
            console.log('     - GET  /api/objectives');
            console.log('     - POST /api/objectives');
            console.log('     - GET  /api/key-results');
            console.log('     - POST /api/key-results');
            console.log('     - GET  /api/initiatives');
            console.log('     - GET  /api/programs');
            console.log('     - GET  /api/pca-items');
            console.log('     - POST /api/pca-items');
            console.log('     - PATCH /api/pca-items/:id/status');
            console.log('');
            console.log(`  CORS Origins: ${allowedOrigins.filter(Boolean).join(', ')}`);
            console.log('');
            console.log('  Banco de Dados: PostgreSQL ✓');
            console.log(`  Database: ${process.env.DB_NAME || 'plataforma_db'}`);
            console.log('');
            console.log('='.repeat(60));
            console.log('');
            console.log('Pressione Ctrl+C para parar o servidor');
            console.log('');
        });

    } catch (error) {
        console.error('\n❌ Erro ao iniciar servidor:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n\nRecebido SIGTERM, encerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n\nRecebido SIGINT, encerrando servidor...');
    process.exit(0);
});

// Iniciar
startServer();

export default app;
