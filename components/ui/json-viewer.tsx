"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, Copy, Check, Pencil, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface JsonViewerProps {
  data: any;
  rootName?: string;
  expandLevel?: number;
}

interface JsonNodeProps {
  data: any;
  name: string;
  level: number;
  defaultExpanded: boolean;
  expandLevel: number;
}

interface JsonEditorProp {
  data: object;
}

export function JsonViewer({ data, rootName = "root", expandLevel = 1 }: JsonViewerProps) {
  const params = useParams();
  const { toast } = useToast();

  function JsonEditor({ data }: JsonEditorProp) {
    const [jsonValue, setJsonValue] = useState(JSON.stringify(data, null, 2));

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setJsonValue(e.target.value);
    };

    const handleDocPatch = async () => {
      const formattedJson = JSON.parse(jsonValue);
      const { _id, ...update } = formattedJson;
      const response = await fetch(`/api/connections/${params.id}/${params.database}/${params.collection}/documents`, {
        method: 'PATCH',
        body: JSON.stringify({
          update: update,
          documentId: _id
        }),
      });
      const jsonRes = await response.json();
      if(jsonRes) {
        toast({
          title: "Updated",
          description: `Document updated Successfully`,
        });
        window?.location?.reload();
      }
    }

    return (
      <>
        <textarea
          className="p-4"
          value={jsonValue}
          onChange={handleChange}
          rows={10}
          cols={50}
          style={{ fontFamily: "monospace", width: "100%" }}
        />
        <Button
          variant="default"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleDocPatch();
          }}
        >
          Save
        </Button>
      </>
    );
  }

  function JsonNode({ data, name, level, defaultExpanded, expandLevel }: JsonNodeProps) {
    const [expanded, setExpanded] = useState(defaultExpanded);
    const [copied, setCopied] = useState(false);
    const [isEditing, setIsEditing] = useState<Boolean>(false);

    const isObject = data !== null && typeof data === "object";
    const isArray = Array.isArray(data);
    const isEmpty = isObject && Object.keys(data).length === 0;

    const handleCopy = () => {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    const handleEditing = () => {
      setIsEditing((prev) => !prev);
    }

    const handleDelete = async () => {
      const { _id } = data;
      const response = await fetch(`/api/connections/${params.id}/${params.database}/${params.collection}/documents`, {
        method: 'DELETE',
        body: JSON.stringify({
          documentId: _id
        }),
      });
      const jsonRes = await response.json();
      if(jsonRes) {
        toast({
          title: "Deleted",
          description: `Document deleted Successfully`,
        });
        window?.location?.reload();
      }
    }

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
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleEditing();
              }}
            >
              {isEditing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
            </Button>

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

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
            >
              <Trash className="h-4 w-4" />
            </Button>

          </div>
        </div>

        {expanded && !isEmpty && (
          <CardContent className="p-0">
            <div className="p-4 space-y-2">
              {isEditing ? <JsonEditor data={data} /> :
                <>
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
                </>
              }
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

  return (
    <div className="font-mono text-sm overflow-y-scroll">
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

