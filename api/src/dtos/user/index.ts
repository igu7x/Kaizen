export type Diretoria = 'SGJT' | 'DPE' | 'DIJUD' | 'DTI' | 'DSTI';

export interface CreateUserDto {
    name: string;
    email: string;
    password?: string; // Opcional na criação se for definido um padrão ou via convite
    role: 'VIEWER' | 'MANAGER' | 'ADMIN';
    status?: 'ACTIVE' | 'INACTIVE';
    diretoria?: Diretoria;
}

export interface UpdateUserDto {
    name?: string;
    email?: string;
    password?: string;
    role?: 'VIEWER' | 'MANAGER' | 'ADMIN';
    status?: 'ACTIVE' | 'INACTIVE';
    diretoria?: Diretoria;
}

export interface UserResponseDto {
    id: number;
    name: string;
    email: string;
    role: 'VIEWER' | 'MANAGER' | 'ADMIN';
    status: 'ACTIVE' | 'INACTIVE';
    diretoria: Diretoria;
    created_at: Date;
    updated_at: Date;
}
