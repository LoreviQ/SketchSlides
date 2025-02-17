interface LogOptions {
    context?: string;
    data?: unknown;
}

const DEBUG = import.meta.env.MODE === 'development';
const APP_NAME = 'SketchSlides';

// List of errors we consider "expected" and don't need to log
const EXPECTED_ERRORS = [
    'AbortError',           // User cancelled an operation
    'NotAllowedError',      // User denied permission
    'NotFoundError'         // File/folder not found
];

class Logger {
    private formatMessage(message: string, options?: LogOptions): string {
        const parts = [`[${APP_NAME}]`];
        if (options?.context) {
            parts.push(`[${options.context}]`);
        }
        parts.push(message);
        return parts.join(' ');
    }

    debug(message: string, options?: LogOptions): void {
        if (DEBUG) {
            console.debug(
                this.formatMessage(message, options),
                options?.data || ''
            );
        }
    }

    info(message: string, options?: LogOptions): void {
        console.info(
            this.formatMessage(message, options),
            options?.data || ''
        );
    }

    warn(message: string, options?: LogOptions): void {
        console.warn(
            this.formatMessage(message, options),
            options?.data || ''
        );
    }

    error(error: unknown, options?: LogOptions): void {
        // Don't log expected errors
        if (error instanceof Error && EXPECTED_ERRORS.includes(error.name)) {
            this.debug(`Expected error: ${error.name}`, { 
                context: options?.context,
                data: error.message 
            });
            return;
        }

        console.error(
            this.formatMessage('An error occurred', options),
            error
        );
    }

    // Utility method for tracking user actions
    track(action: string, options?: LogOptions): void {
        this.debug(`User Action: ${action}`, options);
    }
}

export const logger = new Logger(); 