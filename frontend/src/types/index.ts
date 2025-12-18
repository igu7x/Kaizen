// Tipos de usuário e autenticação
export type UserRole = 'VIEWER' | 'MANAGER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE';
  diretoria?: Directorate;
  password?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Tipos de Diretoria
export type Directorate = 'DIJUD' | 'DPE' | 'DTI' | 'DSTI' | 'SGJT';

export const DIRECTORATES: { value: Directorate; label: string }[] = [
  { value: 'DIJUD', label: 'DIJUD' },
  { value: 'DPE', label: 'DPE' },
  { value: 'DTI', label: 'DTI' },
  { value: 'DSTI', label: 'DSTI' },
  { value: 'SGJT', label: 'SGJT' }
];

// Tipos de Gestão Estratégica
export type OKRStatus = 'CONCLUIDO' | 'EM_ANDAMENTO' | 'NAO_INICIADO';
export type OKRSituation = 'NO_PRAZO' | 'EM_ATRASO' | 'FINALIZADO';
export type BoardStatus = 'A_FAZER' | 'FAZENDO' | 'FEITO';
export type InitiativeLocation = 'BACKLOG' | 'EM_FILA' | 'SPRINT_ATUAL' | 'FORA_SPRINT' | 'CONCLUIDA';
export type Priority = 'SIM' | 'NAO';
export type ExecutionProgress = 'FAZENDO' | 'FEITO' | 'A_FAZER';

export interface Objective {
  id: string;
  code: string;
  title: string;
  description: string;
  directorate: Directorate;
}

export interface KeyResult {
  id: string;
  objectiveId: string;
  code: string;
  description: string;
  status: OKRStatus;
  situation: OKRSituation;
  deadline: string;
  directorate: Directorate;
}

export interface Initiative {
  id: string;
  keyResultId: string;
  title: string;
  description: string;
  boardStatus: BoardStatus;
  location: InitiativeLocation;
  sprintId?: string;
  directorate: Directorate;
}

// Novo tipo para Controle de Execução
export interface ExecutionControl {
  id: string;
  planProgram: string;
  krProjectInitiative: string;
  backlogTasks: string;
  sprintStatus: InitiativeLocation;
  sprintTasks: string;
  progress: ExecutionProgress;
  directorate: Directorate;
}

export interface Program {
  id: string;
  name: string;
  description: string;
  directorate: Directorate;
}

export interface ProgramInitiative {
  id: string;
  programId: string;
  title: string;
  description: string;
  boardStatus: BoardStatus;
  priority: Priority;
  directorate: Directorate;
}

// Tipos para estatísticas dos dashboards
export interface OKRStats {
  total: number;
  concluido: number;
  emAndamento: number;
  aIniciar: number;
  progresso: number;
}

export interface SprintStats {
  backlog: number;
  emFila: number;
  concluido: number;
  sprintAtual: number;
  progresso: number;
}

export interface ChartData {
  name: string;
  concluido?: number;
  emAndamento?: number;
  naoIniciado?: number;
  value?: number;
  [key: string]: string | number | undefined;
}

// Tipos para o módulo de Pessoas (Formulários)
export type FormStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type ResponseStatus = 'DRAFT' | 'SUBMITTED';

export type FieldType =
  | 'SHORT_TEXT'
  | 'LONG_TEXT'
  | 'MULTIPLE_CHOICE'
  | 'CHECKBOXES'
  | 'SCALE'
  | 'DATE'
  | 'NUMBER'
  | 'DROPDOWN';

export interface FormFieldOption {
  id: string;
  label: string;
  value: string;
}

export interface FormFieldConfig {
  options?: FormFieldOption[];
  minValue?: number;
  maxValue?: number;
  minLabel?: string;
  maxLabel?: string;
  placeholder?: string;
}

export interface FormField {
  id: string;
  formId: string;
  sectionId?: string;
  type: FieldType;
  label: string;
  helpText?: string;
  required: boolean;
  order: number;
  config?: FormFieldConfig;
}

export interface FormSection {
  id: string;
  formId: string;
  title: string;
  description?: string;
  order: number;
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  status: FormStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  directorate: Directorate;
  allowedDirectorates?: (Directorate | 'ALL')[];
}

export interface FormResponse {
  id: string;
  formId: string;
  userId: string;
  userName: string;
  status: ResponseStatus;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormAnswer {
  id: string;
  responseId: string;
  fieldId: string;
  value: string | string[] | number;
}

export interface FormWithDetails extends Form {
  sections: FormSection[];
  fields: FormField[];
  responseCount?: number;
}

export interface ResponseWithAnswers extends FormResponse {
  answers: FormAnswer[];
}

// ============================================================
// Tipos para o módulo de Contratações de TI (PCA)
// ============================================================

export type PcaStatus = 'Concluída' | 'Em andamento' | 'Não Iniciada';

export interface PcaItem {
  id: number;
  item_pca: string;
  area_demandante: string;
  responsavel: string;
  objeto: string;
  valor_anual: number;
  data_estimada_contratacao: string;
  status: PcaStatus;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
}

export interface CreatePcaItemDto {
  item_pca: string;
  area_demandante: string;
  responsavel: string;
  objeto: string;
  valor_anual: number;
  data_estimada_contratacao: string;
  status?: PcaStatus;
}

export interface UpdatePcaItemDto {
  item_pca?: string;
  area_demandante?: string;
  responsavel?: string;
  objeto?: string;
  valor_anual?: number;
  data_estimada_contratacao?: string;
  status?: PcaStatus;
}

export interface PcaStats {
  total: number;
  valorTotal: number;
  concluidos: number;
  emAndamento: number;
  naoIniciados: number;
}

export interface PcaFilters {
  areasDemandantes: string[];
  responsaveis: string[];
  meses: string[];
  statusOptions: PcaStatus[];
}

// Constantes para meses ordenados
export const MESES_ORDENADOS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
] as const;

// ============================================================
// Tipos para Detalhes do Item PCA
// ============================================================

export type ValidacaoDgTipo = 'Pendente' | 'Data';
export type ChecklistStatus = 'Concluída' | 'Em andamento' | 'Não Iniciada';
export type TarefaStatus = 'Não iniciada' | 'Em andamento' | 'Concluída';

export interface PcaItemDetails {
  id: number;
  pca_item_id: number;
  validacao_dg_tipo: ValidacaoDgTipo;
  validacao_dg_data: string | null;
  fase_atual: string | null;
  created_at: string;
  updated_at: string;
  updated_by: number | null;
}

export interface PcaChecklistItem {
  id: number;
  pca_item_id: number;
  item_nome: string;
  item_ordem: number;
  status: ChecklistStatus;
  created_at: string;
  updated_at: string;
  updated_by: number | null;
}

export interface PcaChecklistProgress {
  total: number;
  concluidos: number;
  percentual: number;
}

export interface PcaChecklistResponse {
  items: PcaChecklistItem[];
  progress: PcaChecklistProgress;
}

export interface PcaPontoControle {
  id: number;
  pca_item_id: number;
  ponto_controle: string;
  data: string;
  proxima_reuniao: string;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
}

export interface PcaTarefa {
  id: number;
  pca_item_id: number;
  ponto_controle_id: number | null;
  tarefa: string;
  responsavel: string;
  prazo: string;
  status: TarefaStatus;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
}

// Ponto de Controle com tarefas aninhadas
export interface PcaPontoControleComTarefas extends PcaPontoControle {
  tarefas: PcaTarefa[];
}

// DTOs para criação/atualização
export interface UpdatePcaDetailsDto {
  validacao_dg_tipo?: ValidacaoDgTipo;
  validacao_dg_data?: string | null;
  fase_atual?: string | null;
}

export interface CreatePontoControleDto {
  ponto_controle: string;
  data: string;
  proxima_reuniao: string;
}

export interface UpdatePontoControleDto {
  ponto_controle?: string;
  data?: string;
  proxima_reuniao?: string;
}

export interface CreateTarefaDto {
  tarefa: string;
  responsavel: string;
  prazo: string;
  status?: TarefaStatus;
  ponto_controle_id?: number | null;
}

export interface UpdateTarefaDto {
  tarefa?: string;
  ponto_controle_id?: number | null;
  responsavel?: string;
  prazo?: string;
  status?: TarefaStatus;
}

// Resposta completa dos detalhes de um item PCA
export interface PcaItemAllDetails {
  pcaItem: PcaItem;
  details: PcaItemDetails | null;
  checklist: PcaChecklistItem[];
  checklistProgress: PcaChecklistProgress;
  pontosControle: PcaPontoControle[];
  pontosControleComTarefas: PcaPontoControleComTarefas[];
  tarefas: PcaTarefa[];
  tarefasOrfas: PcaTarefa[];
}

// ============================================================
// Tipos para Salvamento em Lote
// ============================================================

export interface SaveAllChangesRequest {
  details?: {
    validacao_dg_tipo?: ValidacaoDgTipo;
    validacao_dg_data?: string | null;
    fase_atual?: string | null;
  };
  checklist_updates?: Array<{ id: number; status: ChecklistStatus }>;
  tarefas_updates?: Array<{ id: number; status: TarefaStatus }>;
}

export interface SaveAllChangesResponse {
  success: boolean;
  message: string;
  saved_count: {
    details: number;
    checklist: number;
    tarefas: number;
  };
  error?: string;
}

// ============================================================
// Tipos para Renovações PCA
// ============================================================

export interface PcaRenovacao {
  id: number;
  item_pca: string;
  area_demandante: string;
  gestor_demandante: string;
  contratada: string;
  objeto: string;
  valor_anual: number;
  data_estimada_contratacao: string;
  status: PcaStatus;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
}

export interface CreateRenovacaoDto {
  item_pca: string;
  area_demandante: string;
  gestor_demandante: string;
  contratada: string;
  objeto: string;
  valor_anual: number;
  data_estimada_contratacao: string;
  status?: PcaStatus;
}

export interface UpdateRenovacaoDto {
  item_pca?: string;
  area_demandante?: string;
  gestor_demandante?: string;
  contratada?: string;
  objeto?: string;
  valor_anual?: number;
  data_estimada_contratacao?: string;
  status?: PcaStatus;
}

export interface RenovacaoStats {
  total: number;
  valorTotal: number;
  concluidos: number;
  emAndamento: number;
  naoIniciados: number;
}

export interface RenovacaoResumo {
  total: number;
  valor_total: number;
  por_status: { [key: string]: number };
  por_area: { [key: string]: { quantidade: number; valor: number } };
  por_mes: { [key: string]: number };
}

export interface RenovacaoFilters {
  areasDemandantes: string[];
  gestores: string[];
  meses: string[];
}

// Tipos para detalhes de renovação
export interface RenovacaoDetails {
  id: number;
  renovacao_id: number;
  validacao_dg_tipo: ValidacaoDgTipo;
  validacao_dg_data: string | null;
  fase_atual: string | null;
  created_at: string;
  updated_at: string;
  updated_by: number | null;
}

export interface RenovacaoChecklistItem {
  id: number;
  renovacao_id: number;
  item_nome: string;
  item_ordem: number;
  status: ChecklistStatus;
  created_at: string;
  updated_at: string;
  updated_by: number | null;
}

export interface RenovacaoPontoControle {
  id: number;
  renovacao_id: number;
  ponto_controle: string;
  data: string;
  proxima_reuniao: string;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
}

export interface RenovacaoTarefa {
  id: number;
  renovacao_id: number;
  ponto_controle_id: number | null;
  tarefa: string;
  responsavel: string;
  prazo: string;
  status: TarefaStatus;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
}

export interface RenovacaoPontoControleComTarefas extends RenovacaoPontoControle {
  tarefas: RenovacaoTarefa[];
}

export interface RenovacaoAllDetails {
  renovacao: PcaRenovacao;
  details: RenovacaoDetails | null;
  checklist: RenovacaoChecklistItem[];
  checklistProgress: number;
  pontosControle: RenovacaoPontoControle[];
  pontosControleComTarefas: RenovacaoPontoControleComTarefas[];
  tarefas: RenovacaoTarefa[];
  tarefasOrfas: RenovacaoTarefa[];
}

export interface SaveRenovacaoChangesRequest {
  details?: {
    validacao_dg_tipo?: ValidacaoDgTipo;
    validacao_dg_data?: string | null;
    fase_atual?: string | null;
  };
  checklist_updates?: Array<{ id: number; status: ChecklistStatus }>;
  tarefas_updates?: Array<{ id: number; status: TarefaStatus; ponto_controle_id?: number | null }>;
}

// ============================================================
// TIPOS DE COMITÊS
// ============================================================

export interface Comite {
  id: number;
  nome: string;
  sigla: string;
  descricao: string | null;
  icone: string | null;
  cor: string;
  ordem: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ComiteMembro {
  id: number;
  comite_id: number;
  nome: string;
  cargo: string;
  ordem: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export type ReuniaoStatus = 'Previsto' | 'Realizada' | 'Cancelada';

export interface ComiteReuniao {
  id: number;
  comite_id: number;
  numero: number;
  ano: number;
  data: string;
  mes: string | null;
  status: ReuniaoStatus;
  titulo: string | null;
  observacoes: string | null;
  link_proad: string | null;
  link_transparencia: string | null;
  link_ata: string | null;
  // Campos de ata (PDF upload)
  ata_filename: string | null;
  ata_filepath: string | null;
  ata_filesize: number | null;
  ata_uploaded_at: string | null;
  ata_uploaded_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface AtaInfo {
  has_ata: boolean;
  filename?: string;
  filesize?: number;
  uploaded_at?: string;
  error?: string;
}

export interface UploadAtaResponse {
  message: string;
  filename: string;
  filesize: number;
  uploaded_at: string;
}

export interface ComiteReuniaoPauta {
  id: number;
  reuniao_id: number;
  numero_item: number;
  descricao: string;
  ordem: number;
  created_at: string;
  updated_at: string;
}

export type QuadroControleStatus = 'Andamento' | 'Concluída' | 'Cancelada';

export interface ComiteQuadroControle {
  id: number;
  comite_id: number;
  item: string;
  discussao_contexto: string | null;
  deliberacao: string | null;
  decisao_encaminhamento: string | null;
  acoes_atividades: string | null;
  responsavel: string | null;
  prazo: string | null;
  observacoes: string | null;
  status: QuadroControleStatus;
  ordem: number;
  created_at: string;
  updated_at: string;
}

// DTOs de Comitês
export interface UpdateComiteDto {
  nome?: string;
  descricao?: string;
  icone?: string;
  cor?: string;
  ordem?: number;
}

export interface CreateMembroDto {
  nome: string;
  cargo: string;
  ordem?: number;
}

export interface UpdateMembroDto {
  nome?: string;
  cargo?: string;
  ordem?: number;
}

export interface CreateReuniaoDto {
  numero: number;
  ano: number;
  data: string;
  mes?: string;
  status?: ReuniaoStatus;
  titulo?: string;
  observacoes?: string;
  link_proad?: string;
  link_transparencia?: string;
  link_ata?: string;
}

export interface UpdateReuniaoDto {
  numero?: number;
  ano?: number;
  data?: string;
  mes?: string;
  status?: ReuniaoStatus;
  titulo?: string;
  observacoes?: string;
  link_proad?: string;
  link_transparencia?: string;
  link_ata?: string;
}

export interface CreatePautaDto {
  numero_item: number;
  descricao: string;
  ordem?: number;
}

export interface UpdatePautaDto {
  numero_item?: number;
  descricao?: string;
  ordem?: number;
}

export interface CreateQuadroControleDto {
  item: string;
  discussao_contexto?: string;
  deliberacao?: string;
  decisao_encaminhamento?: string;
  acoes_atividades?: string;
  responsavel?: string;
  prazo?: string;
  observacoes?: string;
  status?: QuadroControleStatus;
  ordem?: number;
}

export interface UpdateQuadroControleDto {
  item?: string;
  discussao_contexto?: string;
  deliberacao?: string;
  decisao_encaminhamento?: string;
  acoes_atividades?: string;
  responsavel?: string;
  prazo?: string;
  observacoes?: string;
  status?: QuadroControleStatus;
  ordem?: number;
}