import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("CyberHex Error Boundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen bg-neutral-950 bg-cyber-grid flex flex-col items-center justify-center px-4 relative">
          <div className="pointer-events-none fixed inset-0 bg-cyber-radial" />
          <div className="relative z-10 max-w-md text-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 mb-6">
              <AlertTriangle className="h-10 w-10 text-rose-400" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">
              Something went wrong
            </h1>
            <p className="mt-3 text-neutral-400 leading-relaxed">
              An unexpected error occurred. This has been logged — try refreshing
              or head back to home.
            </p>
            {this.state.error && (
              <p className="mt-4 font-mono text-xs text-neutral-600 bg-neutral-900 rounded-xl p-3 max-h-24 overflow-auto">
                {this.state.error.message}
              </p>
            )}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button onClick={this.handleReset}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Link to="/">
                <Button variant="outline">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}