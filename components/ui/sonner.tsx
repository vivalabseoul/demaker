import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      position="top-center"
      className="toaster group"
      toastOptions={{
        style: {
          background: 'white',
          color: '#000',
          border: '1px solid #e1e1e1',
          borderRadius: '1rem',
          padding: '1.2rem',
          fontSize: '1rem',
          fontWeight: 500,
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          zIndex: 9999,
        },
        duration: 3000,
      }}
      style={
        {
          "--normal-bg": "white",
          "--normal-text": "#000",
          "--normal-border": "#e1e1e1",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
