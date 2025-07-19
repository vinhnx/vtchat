import type { ContextSchemaDefinition } from "./context";
import type { EventSchemaDefinition } from "./events";
import type { TaskDefinition } from "./types";

export const createTask = <
    TEvent extends EventSchemaDefinition = any,
    TContext extends ContextSchemaDefinition = any,
>(
    taskDef: TaskDefinition<TEvent, TContext>,
): TaskDefinition<TEvent, TContext> => {
    return taskDef;
};
