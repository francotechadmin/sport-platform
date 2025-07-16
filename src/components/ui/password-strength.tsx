import { getPasswordStrength } from "@/lib/validation";
import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const { level, feedback } = getPasswordStrength(password);

  if (!password) return null;

  const strengthColors = {
    weak: "bg-red-500",
    fair: "bg-orange-500", 
    good: "bg-yellow-500",
    strong: "bg-green-500"
  };

  const strengthLabels = {
    weak: "Weak",
    fair: "Fair",
    good: "Good", 
    strong: "Strong"
  };

  const strengthWidth = {
    weak: "w-1/4",
    fair: "w-2/4",
    good: "w-3/4",
    strong: "w-full"
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">Password strength</span>
        <span className={cn(
          "text-xs font-medium",
          level === 'weak' && "text-red-600",
          level === 'fair' && "text-orange-600",
          level === 'good' && "text-yellow-600", 
          level === 'strong' && "text-green-600"
        )}>
          {strengthLabels[level]}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            strengthColors[level],
            strengthWidth[level]
          )}
        />
      </div>
      
      {feedback.length > 0 && (
        <div className="text-xs text-gray-600">
          <span>Missing: </span>
          {feedback.join(", ")}
        </div>
      )}
    </div>
  );
}