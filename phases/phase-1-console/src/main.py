"""Main entry point for the Todo Console App."""

import sys
from pathlib import Path

# Add src directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from task_manager import TaskManager
from cli import (
    show_menu,
    get_menu_choice,
    handle_add_task,
    handle_view_tasks,
    handle_update_task,
    handle_delete_task,
    handle_toggle_complete,
    display_error
)


def main() -> None:
    """Main application entry point."""
    # Create TaskManager instance
    manager = TaskManager()

    # Display welcome message
    print("\n🎯 Welcome to Todo Console App - Phase I!")
    print("Manage your tasks efficiently from the command line.\n")

    try:
        # Main application loop
        while True:
            # Show menu
            show_menu()

            # Get user choice
            choice = get_menu_choice()

            # Route to appropriate handler
            if choice == 1:
                handle_add_task(manager)
            elif choice == 2:
                handle_view_tasks(manager)
            elif choice == 3:
                handle_update_task(manager)
            elif choice == 4:
                handle_delete_task(manager)
            elif choice == 5:
                handle_toggle_complete(manager)
            elif choice == 6:
                print("\n👋 Thank you for using Todo Console App!")
                print("Your tasks have been cleared (in-memory storage).")
                print("Goodbye!\n")
                break
            else:
                display_error("Invalid choice. Please enter a number between 1 and 6.")

    except KeyboardInterrupt:
        # Handle Ctrl+C gracefully
        print("\n\n👋 Application interrupted. Goodbye!\n")
        sys.exit(0)
    except Exception as e:
        # Handle unexpected errors
        display_error(f"An unexpected error occurred: {e}")
        print("The application will now exit.\n")
        sys.exit(1)


if __name__ == "__main__":
    main()
