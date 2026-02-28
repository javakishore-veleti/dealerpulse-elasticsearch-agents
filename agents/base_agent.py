"""
DealerPulse — Base Agent
Common agent functionality with LangChain tool binding.
"""
from typing import List
from langchain_core.tools import BaseTool
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.language_models import BaseChatModel
from config.llm_config import get_llm
from config.settings import settings


class BaseAgent:
    """Base class for all DealerPulse agents."""

    def __init__(
        self,
        name: str,
        system_prompt: str,
        tools: List[BaseTool],
        temperature: float = 0.1,
    ):
        self.name = name
        self.system_prompt = system_prompt
        self.tools = tools
        self.llm: BaseChatModel = get_llm(temperature=temperature)
        
        # Bind tools to the LLM
        if tools:
            self.llm_with_tools = self.llm.bind_tools(tools)
        else:
            self.llm_with_tools = self.llm

    def run(self, user_input: str) -> str:
        """
        Execute the agent with a user query.
        Implements a simple ReAct loop: Reason → Act → Observe → Repeat.
        """
        messages = [
            SystemMessage(content=self._build_system_prompt()),
            HumanMessage(content=user_input),
        ]

        # ReAct loop (max 8 iterations to prevent runaway)
        for iteration in range(8):
            response = self.llm_with_tools.invoke(messages)
            messages.append(response)

            # Check if the model wants to call tools
            if not response.tool_calls:
                # No more tool calls — return the final text response
                return response.content

            # Execute each tool call
            for tool_call in response.tool_calls:
                tool_name = tool_call["name"]
                tool_args = tool_call["args"]
                
                # Find the matching tool
                tool_fn = next(
                    (t for t in self.tools if t.name == tool_name), None
                )
                
                if tool_fn:
                    try:
                        result = tool_fn.invoke(tool_args)
                    except Exception as e:
                        result = f"Tool error: {str(e)}"
                else:
                    result = f"Unknown tool: {tool_name}"

                # Add tool result to conversation
                from langchain_core.messages import ToolMessage
                messages.append(
                    ToolMessage(content=str(result), tool_call_id=tool_call["id"])
                )

        # If we hit max iterations, return whatever we have
        return response.content if response.content else "Agent reached maximum iterations without a final answer."

    def _build_system_prompt(self) -> str:
        """Build the full system prompt with dealer context."""
        return (
            f"{self.system_prompt}\n\n"
            f"DEALER CONTEXT:\n"
            f"- Dealership: {settings.dealer_name}\n"
            f"- Location: {settings.dealer_location}\n"
            f"- Current Date: Today\n\n"
            f"RESPONSE GUIDELINES:\n"
            f"- Always use your tools to look up real data before answering.\n"
            f"- Provide specific numbers, not vague estimates.\n"
            f"- Include actionable recommendations.\n"
            f"- Reference specific vehicles by stock number or VIN when possible.\n"
            f"- Format currency as $X,XXX.\n"
        )
