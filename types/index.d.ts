export { };

declare global {
    interface Window {
        myBar: any; // 👈️ turn off type checking
        myLine: any; // 👈️ turn off type checking
    }
}