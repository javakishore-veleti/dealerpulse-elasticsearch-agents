"""
DealerPulse — Command Line Interface
Interactive CLI for running scenarios and freeform queries.
"""
import sys
import click
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.markdown import Markdown

sys.path.insert(0, "/app" if __name__ != "__main__" else ".")

console = Console()


def get_agent(agent_type: str):
    """Instantiate an agent by type."""
    if agent_type == "consumer":
        from agents.consumer_agent import ConsumerAgent
        return ConsumerAgent()
    elif agent_type == "sales":
        from agents.sales_agent import SalesAgent
        return SalesAgent()
    elif agent_type == "service":
        from agents.service_agent import ServiceAgent
        return ServiceAgent()
    elif agent_type == "inventory":
        from agents.inventory_agent import InventoryAgent
        return InventoryAgent()
    elif agent_type == "orchestrator":
        from agents.orchestrator import OrchestratorAgent
        return OrchestratorAgent()
    else:
        raise ValueError(f"Unknown agent type: {agent_type}")


def run_scenario(scenario_id: int):
    """Run a specific pre-built scenario."""
    from dealerpulse.scenarios import get_scenario
    
    scenario = get_scenario(scenario_id)
    if not scenario:
        console.print(f"[red]Unknown scenario: {scenario_id}[/red]")
        return
    
    # Display scenario header
    console.print(Panel(
        f"[bold]{scenario['name']}[/bold]\n\n"
        f"{scenario['description']}\n\n"
        f"Agent: [cyan]{scenario['agent'].upper()}[/cyan]",
        title=f"Scenario {scenario_id}",
        border_style="blue",
    ))
    
    console.print("\n[dim]Processing...[/dim]\n")
    
    # Run the agent
    agent = get_agent(scenario["agent"])
    result = agent.run(scenario["prompt"])
    
    # Display result
    console.print(Panel(result, title="Agent Response", border_style="green"))


def interactive_mode():
    """Run interactive mode with scenario selection."""
    from dealerpulse.scenarios import list_scenarios
    
    console.print(Panel(
        "[bold blue]DealerPulse[/bold blue] — Multi-Agent Dealer Operations Intelligence\n\n"
        "Powered by Elasticsearch + LangChain",
        title="Welcome",
        border_style="blue",
    ))
    
    while True:
        console.print("\n[bold]Choose an option:[/bold]")
        
        # Show scenarios
        table = Table(show_header=True, header_style="bold cyan")
        table.add_column("#", width=4)
        table.add_column("Scenario", width=40)
        table.add_column("Agent", width=15)
        
        for s in list_scenarios():
            agent_color = {
                "consumer": "green",
                "sales": "yellow", 
                "service": "red",
                "inventory": "blue",
                "orchestrator": "magenta",
            }.get(s["agent"], "white")
            table.add_row(
                str(s["id"]),
                s["name"],
                f"[{agent_color}]{s['agent'].upper()}[/{agent_color}]"
            )
        
        console.print(table)
        console.print("\n[dim]Enter scenario number (1-7), 'q' to quit, or type a freeform question[/dim]")
        
        try:
            user_input = input("\n> ").strip()
        except (EOFError, KeyboardInterrupt):
            console.print("\n[dim]Goodbye![/dim]")
            break
        
        if not user_input:
            continue
        
        if user_input.lower() in ("q", "quit", "exit"):
            console.print("[dim]Goodbye![/dim]")
            break
        
        # Check if it's a scenario number
        if user_input.isdigit():
            scenario_id = int(user_input)
            if 1 <= scenario_id <= 7:
                run_scenario(scenario_id)
                continue
            else:
                console.print("[red]Please enter a number between 1 and 7.[/red]")
                continue
        
        # Freeform question — route through orchestrator
        console.print("\n[dim]Routing through Orchestrator...[/dim]\n")
        agent = get_agent("orchestrator")
        result = agent.run(user_input)
        console.print(Panel(result, title="DealerPulse Response", border_style="green"))


@click.command()
@click.option("--scenario", "-s", type=int, help="Run a specific scenario (1-7)")
@click.option("--all", "run_all", is_flag=True, help="Run all 7 scenarios sequentially")
@click.option("--ask", "-a", type=str, help="Ask a freeform question")
def main(scenario: int = None, run_all: bool = False, ask: str = None):
    """DealerPulse — Multi-Agent Dealer Operations Intelligence"""
    
    if scenario:
        run_scenario(scenario)
    elif run_all:
        for i in range(1, 8):
            run_scenario(i)
            console.print("\n" + "═" * 60 + "\n")
    elif ask:
        console.print(f"\n[dim]Question: {ask}[/dim]\n")
        agent = get_agent("orchestrator")
        result = agent.run(ask)
        console.print(Panel(result, title="DealerPulse Response", border_style="green"))
    else:
        interactive_mode()


if __name__ == "__main__":
    main()
