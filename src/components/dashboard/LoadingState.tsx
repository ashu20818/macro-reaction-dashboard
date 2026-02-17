import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface LoadingStateProps {
  message?: string;
  submessage?: string;
}

const LoadingState = ({
  message = "Loading data...",
  submessage = "The server may take up to 60 seconds to wake up on first visit."
}: LoadingStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 space-y-4"
    >
      <Loader2 className="h-8 w-8 text-primary animate-spin" />
      <div className="text-center space-y-1.5">
        <p className="text-base font-medium text-foreground">{message}</p>
        <p className="text-sm text-muted-foreground max-w-md">{submessage}</p>
      </div>
    </motion.div>
  );
};

export default LoadingState;
