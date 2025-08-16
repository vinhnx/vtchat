'use client';

import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from '@/components/ai-elements/tool';
import { Task, TaskContent, TaskItem, TaskItemFile, TaskTrigger } from '@/components/ai-elements/task';

export default function AIElementsDemoPage() {
    return (
        <div className="container max-w-4xl mx-auto p-6 space-y-8">
            <div className="space-y-4">
                <h1 className="text-3xl font-bold">AI Elements Integration Demo</h1>
                <p className="text-muted-foreground">
                    This page demonstrates the integration of AI Elements components for tool calls and task workflows.
                </p>
            </div>

            {/* Tool Components Demo */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Tool Components</h2>
                <div className="space-y-4">
                    {/* Tool in pending state */}
                    <Tool>
                        <ToolHeader type="web_search" state="input-streaming" />
                        <ToolContent>
                            <div className="text-sm text-muted-foreground">Tool parameters streaming...</div>
                        </ToolContent>
                    </Tool>

                    {/* Tool with input */}
                    <Tool>
                        <ToolHeader type="math_calculator" state="input-available" />
                        <ToolContent>
                            <ToolInput input={{ expression: "2 + 2 * 3", operation: "calculate" }} />
                        </ToolContent>
                    </Tool>

                    {/* Tool with successful output */}
                    <Tool defaultOpen={true}>
                        <ToolHeader type="document_reader" state="output-available" />
                        <ToolContent>
                            <ToolInput input={{ file_path: "/documents/report.pdf", pages: "1-5" }} />
                            <ToolOutput 
                                output="Successfully extracted text from 5 pages. Found 3,247 words and 12 tables."
                                errorText=""
                            />
                        </ToolContent>
                    </Tool>

                    {/* Tool with error */}
                    <Tool defaultOpen={true}>
                        <ToolHeader type="api_request" state="output-error" />
                        <ToolContent>
                            <ToolInput input={{ url: "https://api.example.com/data", method: "GET" }} />
                            <ToolOutput 
                                output=""
                                errorText="Connection timeout: Unable to reach the API endpoint after 30 seconds"
                            />
                        </ToolContent>
                    </Tool>
                </div>
            </section>

            {/* Task Components Demo */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Task Components</h2>
                <div className="space-y-4">
                    {/* Pending task */}
                    <Task>
                        <TaskTrigger title="Initialize Development Environment" status="pending" />
                        <TaskContent>
                            <TaskItem>Check system requirements</TaskItem>
                            <TaskItem>Install dependencies</TaskItem>
                            <TaskItem>Configure environment variables</TaskItem>
                        </TaskContent>
                    </Task>

                    {/* In progress task */}
                    <Task defaultOpen={true}>
                        <TaskTrigger title="Processing Document Analysis" status="in_progress" />
                        <TaskContent>
                            <TaskItem>Read <TaskItemFile>analysis_report.pdf</TaskItemFile></TaskItem>
                            <TaskItem>Extract key metrics and insights</TaskItem>
                            <TaskItem>Generate summary visualization</TaskItem>
                        </TaskContent>
                    </Task>

                    {/* Completed task */}
                    <Task defaultOpen={true}>
                        <TaskTrigger title="Build React Components" status="completed" />
                        <TaskContent>
                            <TaskItem>Create <TaskItemFile>Button.tsx</TaskItemFile></TaskItem>
                            <TaskItem>Create <TaskItemFile>Input.tsx</TaskItemFile></TaskItem>
                            <TaskItem>Create <TaskItemFile>Modal.tsx</TaskItemFile></TaskItem>
                            <TaskItem>Add unit tests</TaskItem>
                            <TaskItem>Update documentation</TaskItem>
                        </TaskContent>
                    </Task>

                    {/* Error task */}
                    <Task defaultOpen={true}>
                        <TaskTrigger title="Deploy to Production" status="error" />
                        <TaskContent>
                            <TaskItem>Build application bundle</TaskItem>
                            <TaskItem>Run production tests</TaskItem>
                            <TaskItem>Deploy to staging environment</TaskItem>
                            <TaskItem>❌ Production deployment failed: Invalid credentials</TaskItem>
                        </TaskContent>
                    </Task>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Integration Notes</h2>
                <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Tool components automatically open when they have output or errors</p>
                    <p>• Task components support different status states with appropriate icons</p>
                    <p>• Components follow the minimal design principles with muted colors</p>
                    <p>• Existing tool call system has been enhanced with AI Elements styling</p>
                    <p>• Step renderer now uses Task components for better workflow visualization</p>
                </div>
            </section>
        </div>
    );
}