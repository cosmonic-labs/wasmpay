import React from 'react';
import {ChevronDownCircleIcon} from 'lucide-react';
import Container from '@/layout/Container';
import {Heading} from '@repo/ui/Heading';
import {Card} from '@repo/ui/Card';

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
  state: {error: Error | undefined; stack: string; collapsed: boolean} = {
    error: undefined,
    stack: '',
    collapsed: true,
  };

  componentDidCatch(error: unknown, info: {componentStack: string}) {
    this.setState({error, stack: info.componentStack});
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="py-8">
        <Container>
          <Card className="p-6 bg-red-100 border-red-200 dark:bg-red-950 dark:border-red-900">
            <Heading as="h2" className="text-xl">
              Something went wrong.
            </Heading>
            <p className="mb-4">Please refresh the page and try again.</p>
            <code className="block overflow-auto">
              Error: {this.state.error.message ?? 'Unknown Error'}
            </code>
            <Card className="mt-4 -mx-2 -mb-2">
              {this.state.stack && this.state.collapsed ? (
                <button
                  onClick={() => this.setState({collapsed: !this.state.collapsed})}
                  className="flex items-center w-full gap hover:bg-foreground/5"
                >
                  See stack trace
                  <ChevronDownCircleIcon className="w-4 ms-2" />
                </button>
              ) : (
                <code className="block overflow-auto">
                  <pre>{this.state.stack}</pre>
                </code>
              )}
            </Card>
          </Card>
        </Container>
      </div>
    );
  }
}

export {ErrorBoundary};
