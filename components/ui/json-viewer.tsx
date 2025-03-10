"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface JsonViewerProps {
  data: any;
  rootName?: string;
  expandLevel?: number;
}

export function JsonViewer({ data, rootName = "root", expandLevel = 1 }: JsonViewerProps) {
  return (
    <div className="font-mono text-sm">
      <JsonNode 
        data={data} 
        name={rootName} 
        level={0} 
        defaultExpanded={expandLevel > 0} 
        expandLevel={expandLevel}
      />
    </div>
  );
}

interface JsonNodeProps {
  data: any;
  name: string;
  level: number;
  defaultExpanded: boolean;
  expandLevel: number;
}

function JsonNode({ data, name, level, defaultExpanded, expandLevel }: JsonNodeProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);
  
  const isObject = data !== null && typeof data === "object";
  const isArray = Array.isArray(data);
  const isEmpty = isObject && Object.keys(data).length === 0;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };
  
  if (!isObject) {
    return (
      <div className="flex items-start py-1">
        <span className="font-semibold text-blue-600 dark:text-blue-400 mr-2">{name}:</span>
        <span className={cn(
          typeof data === "string" && "text-green-600 dark:text-green-400",
          typeof data === "number" && "text-purple-600 dark:text-purple-400",
          typeof data === "boolean" && "text-yellow-600 dark:text-yellow-400",
          data === null && "text-gray-500 dark:text-gray-400"
        )}>
          {data === null ? "null" : 
           typeof data === "string" ? `"${data}"` : 
           String(data)}
        </span>
      </div>
    );
  }
  
  return (
    <Card className="mb-2 border-muted">
      <div className="flex items-center justify-between px-4 py-2 border-b cursor-pointer" onClick={toggleExpand}>
        <div className="flex items-center">
          {expanded ? 
            <ChevronDown className="h-4 w-4 mr-2 text-muted-foreground" /> : 
            <ChevronRight className="h-4 w-4 mr-2 text-muted-foreground" />
          }
          <span className="font-semibold text-blue-600 dark:text-blue-400 mr-2">{name}</span>
          <span className="text-muted-foreground">
            {isArray ? `Array(${data.length})` : `Object{${Object.keys(data).length}}`}
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      
      {expanded && !isEmpty && (
        <CardContent className="p-0">
          <div className="p-4 space-y-2">
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="ml-4">
                <JsonNode 
                  data={value} 
                  name={key} 
                  level={level + 1} 
                  defaultExpanded={level + 1 < expandLevel}
                  expandLevel={expandLevel}
                />
              </div>
            ))}
          </div>
        </CardContent>
      )}
      
      {expanded && isEmpty && (
        <CardContent>
          <div className="text-muted-foreground italic">
            {isArray ? "Empty array" : "Empty object"}
          </div>
        </CardContent>
      )}
    </Card>
  );
}