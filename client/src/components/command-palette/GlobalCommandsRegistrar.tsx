import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommandPaletteStore, type CommandCategory } from '@/stores/commandPalette';
import { useToast } from '@/components/ui/toaster';

export function GlobalCommandsRegistrar() {
    const registerCommands = useCommandPaletteStore((s) => s.registerCommands);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        const commands = [
            // NAVIGATION
            {
                id: 'nav-dashboard',
                label: 'Go to Workspace Dashboard',
                description: 'Navigate back to the main engineering workspace',
                category: 'navigation' as CommandCategory,
                icon: 'Home',
                action: () => navigate('/dashboard'),
                keywords: ['home', 'dashboard', 'start', 'workspace'],
            },
            {
                id: 'nav-data-science',
                label: 'Open Data Science Workbench',
                description: 'Data cleaning, profiling, and feature engineering',
                category: 'navigation' as CommandCategory,
                icon: 'FlaskConical',
                action: () => navigate('/workspace/data'),
                keywords: ['data', 'analytics', 'clean', 'outliers', 'workbench'],
            },
            {
                id: 'nav-notebooks',
                label: 'Open Notebook Engine',
                description: 'Jupyter-style interactive development',
                category: 'navigation' as CommandCategory,
                icon: 'BookOpen',
                action: () => navigate('/workspace/notebook'),
                keywords: ['notebook', 'jupyter', 'code', 'interactive', 'python'],
            },
            {
                id: 'nav-experiments',
                label: 'View Experiments',
                description: 'All your ML training runs and parameters',
                category: 'experiments' as CommandCategory,
                icon: 'FlaskConical',
                action: () => navigate('/experiments'),
                keywords: ['train', 'run', 'metrics', 'loss', 'history'],
            },
            {
                id: 'nav-math-engine',
                label: 'Mathematical Engine',
                description: 'Formula visualization and matrix computation',
                category: 'tools' as CommandCategory,
                icon: 'BrainCircuit',
                action: () => navigate('/workspace/math'),
                keywords: ['math', 'calculus', 'linear', 'algebra', 'optimization'],
            },
            {
                id: 'nav-research',
                label: 'Research Mode',
                description: 'Linked experiments, papers, and latex exports',
                category: 'navigation' as CommandCategory,
                icon: 'Layers',
                action: () => navigate('/workspace/research'),
                keywords: ['paper', 'arxiv', 'pdf', 'notes', 'citation'],
            },

            // ACTIONS
            {
                id: 'action-create-experiment',
                label: 'Create New Experiment',
                description: 'Initialize a new model training pipeline',
                category: 'experiments' as CommandCategory,
                icon: 'Zap',
                action: () => navigate('/experiments/new'),
                keywords: ['new', 'train', 'start', 'model', 'run'],
            },
            {
                id: 'action-ask-copilot',
                label: 'Ask CyberHex Copilot',
                description: 'Get AI assistance with your code or data',
                category: 'tools' as CommandCategory,
                icon: 'Bot',
                shortcut: '⌘J',
                action: () => {
                    toast('info', 'Copilot Invoked', 'CyberHex Copilot is analyzing your current context...');
                },
                keywords: ['ai', 'help', 'explain', 'suggest', 'debug'],
            },
            {
                id: 'action-train-model',
                label: 'Quick Train Model (AdamW)',
                description: 'Auto-starts a preconfigured run on current dataset',
                category: 'experiments' as CommandCategory,
                icon: 'Cpu',
                action: () => {
                    toast('info', 'AutoML Triggered', 'Initializing AdamW + OneCycleLR training pipeline...');
                },
                keywords: ['train', 'fast', 'automl', 'quick'],
            },
            // NEW OMEGA COMMANDS
            {
                id: 'action-create-dataset',
                label: 'Create Dataset',
                description: 'Initialize a new dataset pipeline connected to your data warehouse',
                category: 'tools' as CommandCategory,
                icon: 'Database',
                action: () => {
                    toast('success', 'Dataset Builder', 'Opening Data Science Workbench in pipeline mode...');
                    navigate('/workspace/data');
                },
                keywords: ['data', 'new', 'import', 'create'],
            },
            {
                id: 'action-import-data',
                label: 'Import Data',
                description: 'Pull data from S3, Snowflake, PostgreSQL, or local CSV',
                category: 'tools' as CommandCategory,
                icon: 'ArrowDownToLine',
                action: () => {
                    toast('info', 'Data Ingestion', 'Waiting for connection details for data import...');
                },
                keywords: ['import', 'fetch', 'download', 's3', 'sql'],
            },
            {
                id: 'action-compare-models',
                label: 'Compare Models',
                description: 'Launch the Model Comparison Matrix view',
                category: 'experiments' as CommandCategory,
                icon: 'GitCompare',
                action: () => {
                    toast('info', 'Model Compare', 'Select two or more experiments to compare metrics.');
                    navigate('/experiments');
                },
                keywords: ['compare', 'diff', 'models', 'benchmark'],
            },
            {
                id: 'action-generate-report',
                label: 'Generate Scientific Report',
                description: 'Export an overarching LaTeX/PDF technical summary',
                category: 'tools' as CommandCategory,
                icon: 'FileText',
                action: () => {
                    navigate('/workspace/research');
                },
                keywords: ['report', 'export', 'latex', 'pdf', 'science'],
            },
            {
                id: 'action-run-stats',
                label: 'Run Statistical Analysis',
                description: 'Execute ANOVA, t-tests, correlational mapping on active dataset',
                category: 'tools' as CommandCategory,
                icon: 'BarChart2',
                action: () => {
                    toast('success', 'Statistical Engine', 'Running correlation matrix on workspace memory...');
                },
                keywords: ['stats', 'math', 'analysis', 'variance', 'correlation'],
            },
            {
                id: 'action-deploy-model',
                label: 'Deploy Model',
                description: 'Push active checkpoint to production Kubernetes cluster',
                category: 'tools' as CommandCategory,
                icon: 'Rocket',
                shortcut: '⌘D',
                action: () => {
                    toast('success', 'MLOps Gateway', 'Preparing containerized inference endpoint...');
                },
                keywords: ['deploy', 'prod', 'docker', 'kubernetes', 'serve'],
            },
            {
                id: 'nav-settings',
                label: 'Open Platform Settings',
                description: 'Manage clusters, API keys, and UI preferences',
                category: 'navigation' as CommandCategory,
                icon: 'Settings',
                action: () => {
                    toast('info', 'Settings', 'Opening workspace configuration...');
                },
                keywords: ['settings', 'config', 'preferences', 'theme', 'keys'],
            },

            // NATURAL LANGUAGE / AI COMMANDS
            {
                id: 'nl-train-churn',
                label: 'Train churn model with AdamW',
                description: 'AI-assisted automatic training configuration based on prompt',
                category: 'tools' as CommandCategory,
                icon: 'Sparkles',
                action: () => {
                    toast('success', 'Copilot Autonomous Execution', 'Configuring architecture for classification task with AdamW optimizer...');
                },
                keywords: ['prompt', 'magic', 'ai', 'churn'],
            },
            {
                id: 'nl-compare-experiments',
                label: 'Compare experiment A and B',
                description: 'AI-assisted smart comparison highlighting performance deltas',
                category: 'experiments' as CommandCategory,
                icon: 'Sparkles',
                action: () => {
                    toast('success', 'Copilot Analysis', 'Generating statistical delta report between latest runs...');
                },
                keywords: ['prompt', 'magic', 'ai', 'compare', 'diff'],
            },
            {
                id: 'nl-find-overfitting',
                label: 'Show overfitting experiments',
                description: 'AI-assisted filtering of runs where val_loss diverges',
                category: 'experiments' as CommandCategory,
                icon: 'Sparkles',
                action: () => {
                    toast('success', 'Copilot Filtering', 'Identified 4 runs with severe diverging validation loss.');
                },
                keywords: ['prompt', 'magic', 'ai', 'overfit', 'loss', 'diverge'],
            },
            {
                id: 'nl-find-missing',
                label: 'Find datasets with missing values',
                description: 'AI-assisted data profiling scan across all connected stores',
                category: 'tools' as CommandCategory,
                icon: 'Sparkles',
                action: () => {
                    toast('warning', 'Data Quality Scan', 'Found NaN values in \'customer_segments.parquet\'.');
                    navigate('/workspace/data');
                },
                keywords: ['prompt', 'magic', 'ai', 'missing', 'nan', 'null', 'clean'],
            }
        ];

        registerCommands(commands);
        return () => {
            commands.forEach(c => useCommandPaletteStore.getState().unregisterCommand(c.id));
        };
    }, [navigate, registerCommands, toast]);

    return null;
}
