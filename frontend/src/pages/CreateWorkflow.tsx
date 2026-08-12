import { useState } from "react";

import { createWorkflow } from "../api/client";

type CreateWorkflowProps = {
    onCreated: () => void;
};

function CreateWorkflow({
    onCreated,
}: CreateWorkflowProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (!title.trim()) {
            setError(
                "Workflow title is required.",
            );

            return;
        }


        try {
            setLoading(true);
            setError(null);

            await createWorkflow({
                title: title.trim(),

                description:
                    description.trim() || null,
            });

            setTitle("");
            setDescription("");

            onCreated();
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError(
                    "Failed to create workflow.",
                );
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="create-workflow">

            <div className="create-workflow-header">

                <div className="create-workflow-icon">
                    +
                </div>

                <div>
                    <h2>
                        Create a workflow
                    </h2>

                    <p>
                        Define what your AI
                        workflow should do.
                    </p>
                </div>

            </div>


            <form
                className="create-workflow-form"
                onSubmit={handleSubmit}
            >

                {/* WORKFLOW NAME */}

                <div className="form-group">

                    <label htmlFor="workflow-title">
                        Workflow name
                    </label>

                    <input
                        id="workflow-title"
                        type="text"
                        value={title}
                        onChange={(event) =>
                            setTitle(
                                event.target.value,
                            )
                        }
                        placeholder="e.g. PDF Summarizer"
                        disabled={loading}
                    />

                </div>


                {/* DESCRIPTION */}

                <div className="form-group">

                    <label htmlFor="workflow-description">
                        Description

                        <span>
                            Optional
                        </span>
                    </label>

                    <textarea
                        id="workflow-description"
                        value={description}
                        onChange={(event) =>
                            setDescription(
                                event.target.value,
                            )
                        }
                        placeholder="Describe your workflow..."
                        disabled={loading}
                        rows={3}
                    />

                </div>

                {/* ERROR */}

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}


                {/* FOOTER */}

                <div className="create-workflow-footer">

                    <p>
                        The AI instructions
                        define how this workflow
                        processes user input.
                    </p>

                    <button
                        className="primary-button"
                        type="submit"
                        disabled={
                            loading ||
                            !title.trim()
                        }
                    >
                        {loading
                            ? "Creating..."
                            : "Create workflow"}
                    </button>

                </div>

            </form>

        </div>
    );
}

export default CreateWorkflow;