"use client";

import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Input,
} from "@repo/ui";
import { ChevronDown, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

interface SchemaField {
    id: string;
    name: string;
    type: "string" | "number" | "boolean" | "array" | "object";
    description: string;
    optional: boolean;
}

interface CustomSchemaBuilderProps {
    onSchemaCreate: (schema: { schema: z.ZodSchema; type: string }) => void;
    onClose: () => void;
}

const typeOptions = [
    { value: "string", label: "Text" },
    { value: "number", label: "Number" },
    { value: "boolean", label: "Boolean" },
    { value: "array", label: "Array" },
    { value: "object", label: "Object" },
];

export const CustomSchemaBuilder = ({ onSchemaCreate, onClose }: CustomSchemaBuilderProps) => {
    const [schemaName, setSchemaName] = useState("");
    const [fields, setFields] = useState<SchemaField[]>([
        { id: "1", name: "", type: "string", description: "", optional: false },
    ]);
    const [showPreview, setShowPreview] = useState(false);

    const addField = () => {
        const newField: SchemaField = {
            id: Date.now().toString(),
            name: "",
            type: "string",
            description: "",
            optional: false,
        };
        setFields([...fields, newField]);
    };

    const removeField = (id: string) => {
        if (fields.length > 1) {
            setFields(fields.filter((f) => f.id !== id));
        }
    };

    const updateField = (id: string, updates: Partial<SchemaField>) => {
        setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
    };

    const createSchema = () => {
        if (!schemaName.trim()) {
            return;
        }

        const validFields = fields.filter((f) => f.name.trim());
        if (validFields.length === 0) {
            return;
        }

        const schemaFields: Record<string, any> = {};

        validFields.forEach((field) => {
            let zodType;
            switch (field.type) {
                case "string":
                    zodType = z.string();
                    break;
                case "number":
                    zodType = z.number();
                    break;
                case "boolean":
                    zodType = z.boolean();
                    break;
                case "array":
                    zodType = z.array(z.string());
                    break;
                case "object":
                    zodType = z.record(z.any());
                    break;
                default:
                    zodType = z.string();
            }

            if (field.description) {
                zodType = zodType.describe(field.description);
            }

            if (field.optional) {
                zodType = zodType.optional();
            }

            schemaFields[field.name] = zodType;
        });

        const schema = z.object(schemaFields);
        onSchemaCreate({
            schema,
            type: schemaName.toLowerCase().replace(/\s+/g, "_"),
        });
    };

    const generatePreview = () => {
        const validFields = fields.filter((f) => f.name.trim());
        const preview: Record<string, any> = {};

        validFields.forEach((field) => {
            let example;
            switch (field.type) {
                case "string":
                    example = field.description
                        ? `"${field.description.toLowerCase()}"`
                        : '"example text"';
                    break;
                case "number":
                    example = 42;
                    break;
                case "boolean":
                    example = true;
                    break;
                case "array":
                    example = ["item1", "item2"];
                    break;
                case "object":
                    example = { key: "value" };
                    break;
                default:
                    example = '"example"';
            }

            if (!field.optional) {
                preview[field.name] = example;
            }
        });

        return JSON.stringify(preview, null, 2);
    };

    return (
        <Card className="mx-auto w-full max-w-2xl">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Custom Schema Builder</CardTitle>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setShowPreview(!showPreview)}
                            size="sm"
                            variant="ghost"
                        >
                            {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                            Preview
                        </Button>
                        <Button onClick={onClose} size="sm" variant="ghost">
                            Cancel
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label className="text-sm font-medium">Schema Name</label>
                    <Input
                        className="mt-1"
                        onChange={(e) => setSchemaName(e.target.value)}
                        placeholder="e.g., Financial Report, Meeting Notes"
                        value={schemaName}
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Fields</label>
                        <Button onClick={addField} size="sm" variant="outlined">
                            <Plus className="mr-1" size={14} />
                            Add Field
                        </Button>
                    </div>

                    {fields.map((field) => (
                        <div className="space-y-2 rounded-lg border p-3" key={field.id}>
                            <div className="flex items-center gap-2">
                                <div className="flex-1">
                                    <Input
                                        className="text-sm"
                                        onChange={(e) =>
                                            updateField(field.id, { name: e.target.value })
                                        }
                                        placeholder="Field name"
                                        value={field.name}
                                    />
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button className="w-24" size="sm" variant="outlined">
                                            {typeOptions.find((opt) => opt.value === field.type)
                                                ?.label || "Text"}
                                            <ChevronDown className="ml-1" size={14} />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {typeOptions.map((option) => (
                                            <DropdownMenuItem
                                                key={option.value}
                                                onClick={() =>
                                                    updateField(field.id, {
                                                        type: option.value as SchemaField["type"],
                                                    })
                                                }
                                            >
                                                {option.label}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <label className="flex items-center text-sm">
                                    <input
                                        checked={field.optional}
                                        className="mr-1"
                                        onChange={(e) =>
                                            updateField(field.id, { optional: e.target.checked })
                                        }
                                        type="checkbox"
                                    />
                                    Optional
                                </label>
                                {fields.length > 1 && (
                                    <Button
                                        onClick={() => removeField(field.id)}
                                        size="icon-sm"
                                        variant="ghost"
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                )}
                            </div>
                            <Input
                                className="text-sm"
                                onChange={(e) =>
                                    updateField(field.id, { description: e.target.value })
                                }
                                placeholder="Description (helps AI understand what to extract)"
                                value={field.description}
                            />
                        </div>
                    ))}
                </div>

                {showPreview && (
                    <div>
                        <label className="text-sm font-medium">Expected Output Preview</label>
                        <pre className="bg-muted mt-1 max-h-40 overflow-auto rounded border p-3 text-sm">
                            {generatePreview()}
                        </pre>
                    </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                    <Button onClick={onClose} variant="outlined">
                        Cancel
                    </Button>
                    <Button
                        disabled={!(schemaName.trim() && fields.some((f) => f.name.trim()))}
                        onClick={createSchema}
                    >
                        Create & Extract
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
