declare module 'react' {
    export = React;
}
declare module 'react-dom/client';
declare module 'react-router-dom';
declare module 'lucide-react';
declare module 'axios';
declare module 'vite';
declare module '@vitejs/plugin-react';
declare module 'path';
declare module 'url';
declare module 'react/jsx-runtime';

declare namespace React {
    type ReactNode = any;
    type FC<P = any> = (props: P) => any;
    type FormEvent<T = any> = any;
    type ChangeEvent<T = any> = any;
    function useState<T = any>(init?: T | (() => T)): [T, (val: T | ((prev: T) => T)) => void];
    function useEffect(effect: () => void | (() => void), deps?: any[]): void;
    function createContext<T = any>(val?: T | undefined): any;
    function useContext<T = any>(ctx: any): T;
}

declare namespace JSX {
    interface IntrinsicElements {
        [elemName: string]: any;
    }
}
