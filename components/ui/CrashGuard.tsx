'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    name?: string;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class CrashGuard extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`CrashGuard caught error in ${this.props.name || 'component'}:`, error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-red-800 uppercase tracking-wider">
                            {this.props.name || 'Component'} Error
                        </p>
                        <p className="text-xs text-red-600 mt-0.5">
                            Restoring functionality...
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
