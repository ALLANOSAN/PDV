export interface DialogConfig {
    type: "confirm" | "alert" | "prompt";
    title: string;
    message: string;
    onConfirm: (value?: string) => void;
    onCancel?: () => void;
}
