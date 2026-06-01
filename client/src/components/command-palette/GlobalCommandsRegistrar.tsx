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
                action: () => navigate('/data-science'),
                keywords: ['data', 'analytics', 'clean', 'outliers', 'workbench'],
            },
            {
                id: 'nav-notebooks',
                label: 'Open Notebook Engine',
                description: 'Jupyter-style interactive development',
                category: 'navigation' as CommandCategory,
                icon: 'BookOpen',
                action: () => navigate('/notebooks'),
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
                action: () => navigate('/math'),
                keywords: ['math', 'calculus', 'linear', 'algebra', 'optimization'],
            },
            {
                id: 'nav-research',
                label: 'Research Mode',
                description: 'Linked experiments, papers, and latex exports',
                category: 'navigation' as CommandCategory,
                icon: 'Layers',
                action: () => navigate('/research'),
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
            }
        ];

        registerCommands(commands);
        return () => {
            commands.forEach(c => useCommandPaletteStore.getState().unregisterCommand(c.id));
        };
    }, [navigate, registerCommands, toast]);

    return null;
}
