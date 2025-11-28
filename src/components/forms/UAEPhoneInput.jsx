import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// UAE country codes and validation
const UAE_CODES = [
  { code: "+971", label: "UAE (+971)", minLength: 9, maxLength: 9 },
];

export default function UAEPhoneInput({ 
  value, 
  onChange, 
  label = "Mobile Number",
  required = false,
  className = "",
  showVerification = false,
  onVerificationRequest = null
}) {
  const [countryCode, setCountryCode] = useState("+971");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isValid, setIsValid] = useState(null);
  const [error, setError] = useState("");

  // Parse initial value
  useEffect(() => {
    if (value) {
      // Remove spaces and format
      const cleaned = value.replace(/\s+/g, "");
      if (cleaned.startsWith("+971")) {
        setCountryCode("+971");
        setPhoneNumber(cleaned.substring(4));
      } else if (cleaned.startsWith("971")) {
        setCountryCode("+971");
        setPhoneNumber(cleaned.substring(3));
      } else if (cleaned.startsWith("0")) {
        setCountryCode("+971");
        setPhoneNumber(cleaned.substring(1));
      } else {
        setPhoneNumber(cleaned);
      }
    }
  }, []);

  const validatePhone = (number) => {
    // Remove any non-digit characters
    const digits = number.replace(/\D/g, "");
    
    // UAE mobile numbers start with 50, 52, 54, 55, 56, 58 or landlines
    const validMobilePrefixes = ["50", "52", "54", "55", "56", "58"];
    const validLandlinePrefixes = ["2", "3", "4", "6", "7", "9"];
    
    if (digits.length === 0) {
      return { valid: null, error: "" };
    }
    
    // Check length (should be 9 digits for UAE)
    if (digits.length < 9) {
      return { valid: false, error: "Number too short. UAE numbers have 9 digits" };
    }
    
    if (digits.length > 9) {
      return { valid: false, error: "Number too long. UAE numbers have 9 digits" };
    }
    
    // Check if it starts with valid prefix
    const prefix2 = digits.substring(0, 2);
    const prefix1 = digits.substring(0, 1);
    
    if (validMobilePrefixes.includes(prefix2) || validLandlinePrefixes.includes(prefix1)) {
      return { valid: true, error: "" };
    }
    
    return { valid: false, error: "Invalid UAE number. Mobile numbers start with 50, 52, 54, 55, 56, or 58" };
  };

  const handlePhoneChange = (e) => {
    let input = e.target.value;
    
    // Remove non-digit characters except for leading zeros
    input = input.replace(/[^\d]/g, "");
    
    // Remove leading zero if present (UAE format)
    if (input.startsWith("0")) {
      input = input.substring(1);
    }
    
    // Limit to 9 digits
    if (input.length > 9) {
      input = input.substring(0, 9);
    }
    
    setPhoneNumber(input);
    
    const validation = validatePhone(input);
    setIsValid(validation.valid);
    setError(validation.error);
    
    // Format and pass to parent
    if (input.length > 0) {
      const formatted = `${countryCode} ${input.substring(0, 2)} ${input.substring(2, 5)} ${input.substring(5)}`.trim();
      onChange(formatted);
    } else {
      onChange("");
    }
  };

  const formatDisplayNumber = (num) => {
    if (!num) return "";
    // Format: XX XXX XXXX
    const parts = [];
    if (num.length >= 2) parts.push(num.substring(0, 2));
    if (num.length >= 5) parts.push(num.substring(2, 5));
    if (num.length > 5) parts.push(num.substring(5));
    return parts.join(" ");
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="flex items-center gap-2 text-slate-700">
        <Phone className="w-4 h-4 text-violet-600" />
        {label} {required && <span className="text-rose-500">*</span>}
      </Label>
      
      <div className="flex gap-2">
        <Select value={countryCode} onValueChange={setCountryCode}>
          <SelectTrigger className="w-32 h-12">
            <SelectValue>
              <span className="flex items-center gap-2">
                <span>🇦🇪</span>
                <span>{countryCode}</span>
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {UAE_CODES.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                <span className="flex items-center gap-2">
                  <span>🇦🇪</span>
                  <span>{c.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="relative flex-1">
          <Input
            type="tel"
            placeholder="50 XXX XXXX"
            value={formatDisplayNumber(phoneNumber)}
            onChange={handlePhoneChange}
            className={`h-12 text-lg pr-10 ${
              isValid === true ? "border-emerald-500 focus-visible:ring-emerald-500" : 
              isValid === false ? "border-rose-500 focus-visible:ring-rose-500" : ""
            }`}
          />
          {isValid !== null && (
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
      
      {error && (
        <p className="text-sm text-rose-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
      
      {isValid && showVerification && onVerificationRequest && (
        <button
          type="button"
          onClick={onVerificationRequest}
          className="text-sm text-violet-600 hover:text-violet-700 font-medium"
        >
          Verify this number →
        </button>
      )}
      
      <p className="text-xs text-slate-400">
        Enter your UAE mobile number (e.g., 50 123 4567)
      </p>
    </div>
  );
}