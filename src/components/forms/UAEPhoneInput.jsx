import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, CheckCircle2, AlertCircle } from "lucide-react";

export default function UAEPhoneInput({ 
  value, 
  onChange, 
  label = "Mobile Number",
  required = false,
  className = ""
}) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isValid, setIsValid] = useState(null);
  const [error, setError] = useState("");

  // Parse initial value on mount only
  useEffect(() => {
    if (value && !phoneNumber) {
      const cleaned = value.replace(/\D/g, "");
      let digits = cleaned;
      if (digits.startsWith("971")) {
        digits = digits.substring(3);
      }
      if (digits.startsWith("0")) {
        digits = digits.substring(1);
      }
      setPhoneNumber(digits.substring(0, 9));
    }
  }, []);

  const validatePhone = (digits) => {
    if (digits.length === 0) {
      return { valid: null, error: "" };
    }
    
    if (digits.length < 9) {
      return { valid: false, error: `${9 - digits.length} more digits needed` };
    }
    
    if (digits.length > 9) {
      return { valid: false, error: "Too many digits" };
    }
    
    const validPrefixes = ["50", "52", "54", "55", "56", "58"];
    const prefix = digits.substring(0, 2);
    
    if (!validPrefixes.includes(prefix)) {
      return { valid: false, error: "Must start with 50, 52, 54, 55, 56, or 58" };
    }
    
    return { valid: true, error: "" };
  };

  const handleChange = (e) => {
    let input = e.target.value.replace(/\D/g, "");
    
    if (input.startsWith("0")) {
      input = input.substring(1);
    }
    
    if (input.length > 9) {
      input = input.substring(0, 9);
    }
    
    setPhoneNumber(input);
    
    const validation = validatePhone(input);
    setIsValid(validation.valid);
    setError(validation.error);
    
    if (input.length > 0) {
      onChange(`+971 ${input}`);
    } else {
      onChange("");
    }
  };

  const formatDisplay = (num) => {
    if (!num) return "";
    if (num.length <= 2) return num;
    if (num.length <= 5) return `${num.substring(0, 2)} ${num.substring(2)}`;
    return `${num.substring(0, 2)} ${num.substring(2, 5)} ${num.substring(5)}`;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="flex items-center gap-2 text-slate-700">
        <Phone className="w-4 h-4 text-violet-600" />
        {label} {required && <span className="text-rose-500">*</span>}
      </Label>
      
      <div className="flex gap-2">
        <div className="flex items-center px-3 h-12 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-medium">
          🇦🇪 +971
        </div>
        
        <div className="relative flex-1">
          <Input
            type="tel"
            inputMode="numeric"
            placeholder="50 123 4567"
            value={formatDisplay(phoneNumber)}
            onChange={handleChange}
            className={`h-12 text-lg ${
              isValid === true ? "border-emerald-500" : 
              isValid === false ? "border-rose-500" : ""
            }`}
          />
          {isValid !== null && phoneNumber.length > 0 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isValid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-500" />
              )}
            </div>
          )}
        </div>
      </div>
      
      {error && phoneNumber.length > 0 && (
        <p className="text-xs text-rose-600">{error}</p>
      )}
    </div>
  );
}