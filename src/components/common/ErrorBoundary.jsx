import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error("UI boundary caught an error", error, info);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="page-shell py-8 sm:py-12" role="alert">
        <section className="data-card mx-auto w-full max-w-xl">
          <div className="empty-state min-h-[18rem]">
            <span className="icon-tile h-11 w-11 text-red-600">
              <AlertTriangle size={20} aria-hidden="true" />
            </span>
            <h1 className="mt-2 text-base font-semibold text-slate-900 dark:text-white">
              This page could not be displayed
            </h1>
            <p className="max-w-md text-sm text-slate-500">
              The issue was contained so the rest of the CRM remains protected. Reload this page to try again.
            </p>
            <button type="button" onClick={this.handleReload} className="btn-primary mt-3">
              <RefreshCw size={16} aria-hidden="true" />
              Reload page
            </button>
          </div>
        </section>
      </main>
    );
  }
}
