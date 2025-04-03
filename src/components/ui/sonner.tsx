import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "#2A2A2A",
          "--normal-text": "#6FC7BA",
          "--normal-border": "rgba(255, 255, 255, 0.1)",
          "--success-bg": "#2A2A2A",
          "--success-text": "#FFFFFF",
          "--success-border": "rgba(255, 255, 255, 0.1)",
          "--error-bg": "#2A2A2A",
          "--error-text": "#FFFFFF",
          "--error-border": "rgba(255, 255, 255, 0.1)",
          "--info-bg": "#2A2A2A",
          "--info-text": "#FFFFFF",
          "--info-border": "rgba(255, 255, 255, 0.1)",
          "--warning-bg": "#2A2A2A",
          "--warning-text": "#FFFFFF",
          "--warning-border": "rgba(255, 255, 255, 0.1)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
