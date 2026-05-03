import { Component, ReactNode } from "react";
import { Zap, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-full border-2 border-destructive/50 bg-destructive/10 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(255,0,80,0.3)]">
              <Zap className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="text-3xl font-display font-bold uppercase tracking-widest text-white mb-3">
              Quantum Decoherence
            </h2>
            <p className="text-muted-foreground font-mono mb-2 text-sm">
              {this.props.fallbackTitle || "A critical waveform collapse has been detected."}
            </p>
            {this.state.error && (
              <p className="text-destructive/70 font-mono text-xs mb-6 bg-destructive/10 border border-destructive/20 rounded p-3">
                {this.state.error.message}
              </p>
            )}
            <Button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="bg-destructive/20 text-destructive border border-destructive hover:bg-destructive hover:text-white transition-all font-display uppercase tracking-widest"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Re-initialize
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
