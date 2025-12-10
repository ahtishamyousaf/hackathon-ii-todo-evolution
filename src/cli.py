"""Command-line interface for the Todo Console App."""

from typing import List

from models import Task
from task_manager import TaskManager


def show_menu() -> None:
    """Display the main menu."""
    print("\n" + "=" * 35)
    print("   Todo Console App - Phase I")
    print("=" * 35)
    print("\nMain Menu:")
    print("  1. Add new task")
    print("  2. View all tasks")
    print("  3. Update task")
    print("  4. Delete task")
    print("  5. Mark task as complete")
    print("  6. Exit")


def get_menu_choice() -> int:
    """Get and validate menu choice from user.

    Returns:
        Valid menu choice (1-6), or 0 if invalid
    """
    try:
        choice = int(input("\nEnter your choice (1-6): ").strip())
        if 1 <= choice <= 6:
            return choice
        return 0
    except ValueError:
        return 0


def display_error(message: str) -> None:
    """Display error message with formatting.

    Args:
        message: Error message to display
    """
    print(f"❌ Error: {message}")


def display_success(message: str) -> None:
    """Display success message with formatting.

    Args:
        message: Success message to display
    """
    print(f"✓ {message}")


def handle_add_task(manager: TaskManager) -> None:
    """Handle the add task user interaction.

    Args:
        manager: TaskManager instance
    """
    print("\n--- Add New Task ---")

    # Get and validate title
    while True:
        title = input("Task title: ").strip()
        if not title:
            display_error("Task title cannot be empty. Please enter a title.")
            continue
        if len(title) > 200:
            display_error(f"Title too long (max 200 characters). Current length: {len(title)}")
            continue
        break

    # Get and validate description
    while True:
        description = input("Task description (optional): ").strip()
        if len(description) > 1000:
            display_error(f"Description too long (max 1000 characters). Current length: {len(description)}")
            continue
        break

    # Create task
    try:
        task = manager.add_task(title, description)
        display_success(
            f"Task created successfully!\n"
            f"  ID: {task.id}\n"
            f"  Title: {task.title}\n"
            f"  Description: {task.description or 'No description'}\n"
            f"  Status: Pending"
        )
    except ValueError as e:
        display_error(f"Failed to create task: {e}")

    input("\nPress Enter to return to menu...")


def format_task_list(tasks: List[Task]) -> str:
    """Format task list as a table.

    Args:
        tasks: List of Task objects

    Returns:
        Formatted string with table
    """
    # Sort by ID
    sorted_tasks = sorted(tasks, key=lambda t: t.id)

    # Table header
    lines = []
    lines.append("ID  | Status    | Title                | Created")
    lines.append("----|-----------|---------------------|-------------------")

    # Table rows
    for task in sorted_tasks:
        # Format ID (right-aligned, width 4)
        id_str = f"{task.id:>3} "

        # Format status
        status_str = "✓ Done    " if task.completed else "○ Pending "

        # Format title (truncate if needed)
        if len(task.title) <= 25:
            title_str = task.title.ljust(25)
        else:
            title_str = task.title[:22] + "..."

        # Format date
        date_str = task.created_at.strftime("%Y-%m-%d %H:%M")

        # Combine row
        row = f"{id_str}| {status_str}| {title_str}| {date_str}"
        lines.append(row)

    # Summary statistics
    total = len(sorted_tasks)
    completed = sum(1 for t in sorted_tasks if t.completed)
    pending = total - completed

    lines.append("")
    lines.append(f"Total: {total} tasks ({completed} completed, {pending} pending)")

    return "\n".join(lines)


def handle_view_tasks(manager: TaskManager) -> None:
    """Handle the view tasks user interaction.

    Args:
        manager: TaskManager instance
    """
    print("\n--- Your Tasks ---\n")

    try:
        tasks = manager.get_all_tasks()

        if not tasks:
            print("No tasks yet. Add your first task!")
        else:
            print(format_task_list(tasks))

    except Exception as e:
        display_error(f"Unable to retrieve tasks: {e}")

    input("\nPress Enter to return to menu...")


def handle_update_task(manager: TaskManager) -> None:
    """Handle the update task user interaction.

    Args:
        manager: TaskManager instance
    """
    print("\n--- Update Task ---")

    # Get and validate task ID
    while True:
        id_input = input("Enter task ID to update: ").strip()
        if not id_input:
            return  # Allow exit
        try:
            task_id = int(id_input)
            break
        except ValueError:
            display_error("Invalid ID. Please enter a number.")

    # Get existing task
    task = manager.get_task_by_id(task_id)
    if not task:
        display_error(f"Task with ID {task_id} not found.")
        input("\nPress Enter to return to menu...")
        return

    # Display current task details
    print(f"\nCurrent task details:")
    print(f"  ID: {task.id}")
    print(f"  Title: {task.title}")
    print(f"  Description: {task.description or 'No description'}")
    print(f"  Status: {'Complete' if task.completed else 'Pending'}")
    print()

    # Get new title (optional)
    new_title = None
    while True:
        title_input = input("New title (press Enter to keep current): ").strip()
        if not title_input:
            # Keep current title
            break
        if len(title_input) > 200:
            display_error(f"Title too long (max 200 characters). Current length: {len(title_input)}")
            continue
        new_title = title_input
        break

    # Get new description (optional)
    new_description = None
    while True:
        desc_input = input("New description (press Enter to keep current): ").strip()
        if not desc_input:
            # Keep current description
            break
        if len(desc_input) > 1000:
            display_error(f"Description too long (max 1000 characters). Current length: {len(desc_input)}")
            continue
        new_description = desc_input
        break

    # Check if any changes
    if new_title is None and new_description is None:
        print("No changes made to task.")
        input("\nPress Enter to return to menu...")
        return

    # Update task
    try:
        updated_task = manager.update_task(task_id, new_title, new_description)
        if updated_task:
            display_success(
                f"Task updated successfully!\n"
                f"  ID: {updated_task.id}\n"
                f"  Title: {updated_task.title}\n"
                f"  Description: {updated_task.description or 'No description'}\n"
                f"  Status: {'Complete' if updated_task.completed else 'Pending'}\n"
                f"  Updated: {updated_task.updated_at.strftime('%Y-%m-%d %H:%M')}"
            )
        else:
            display_error("Failed to update task.")
    except ValueError as e:
        display_error(f"Failed to update task: {e}")

    input("\nPress Enter to return to menu...")


def handle_delete_task(manager: TaskManager) -> None:
    """Handle the delete task user interaction.

    Args:
        manager: TaskManager instance
    """
    print("\n--- Delete Task ---")

    # Get and validate task ID
    while True:
        id_input = input("Enter task ID to delete: ").strip()
        if not id_input:
            return  # Allow exit
        try:
            task_id = int(id_input)
            break
        except ValueError:
            display_error("Invalid ID. Please enter a number.")

    # Get task details
    task = manager.get_task_by_id(task_id)
    if not task:
        display_error(f"Task with ID {task_id} not found.")
        input("\nPress Enter to return to menu...")
        return

    # Display task to be deleted
    print(f"\nTask to delete:")
    print(f"  ID: {task.id}")
    print(f"  Title: {task.title}")
    print(f"  Description: {task.description or 'No description'}")
    print(f"  Status: {'Complete' if task.completed else 'Pending'}")
    print()
    print("⚠️  This action cannot be undone!")

    # Ask for confirmation
    confirmation = input("Are you sure you want to delete this task? (y/n): ").strip().lower()

    if confirmation in ['y', 'yes']:
        # Delete task
        success = manager.delete_task(task_id)
        if success:
            display_success(
                f"Task deleted successfully!\n"
                f"  Deleted task:\n"
                f"  - ID: {task.id}\n"
                f"  - Title: {task.title}\n"
                f"  - Description: {task.description or 'No description'}"
            )
        else:
            display_error("Failed to delete task.")
    else:
        print("Deletion canceled. Task not deleted.")

    input("\nPress Enter to return to menu...")


def handle_toggle_complete(manager: TaskManager) -> None:
    """Handle the mark complete user interaction.

    Args:
        manager: TaskManager instance
    """
    print("\n--- Mark Task as Complete ---")

    # Get and validate task ID
    while True:
        id_input = input("Enter task ID: ").strip()
        if not id_input:
            return  # Allow exit
        try:
            task_id = int(id_input)
            break
        except ValueError:
            display_error("Invalid ID. Please enter a number.")

    # Get task
    task = manager.get_task_by_id(task_id)
    if not task:
        display_error(f"Task with ID {task_id} not found.")
        input("\nPress Enter to return to menu...")
        return

    # Show current status
    old_status = "Complete" if task.completed else "Pending"
    print(f"\nCurrent task:")
    print(f"  ID: {task.id}")
    print(f"  Title: {task.title}")
    print(f"  Description: {task.description or 'No description'}")
    print(f"  Status: {old_status}")

    # Toggle status
    updated_task = manager.toggle_complete(task_id)

    if updated_task:
        new_status = "Complete" if updated_task.completed else "Pending"
        display_success(
            f"Status changed: {old_status} → {new_status}\n\n"
            f"Updated task:\n"
            f"  ID: {updated_task.id}\n"
            f"  Title: {updated_task.title}\n"
            f"  Description: {updated_task.description or 'No description'}\n"
            f"  Status: {new_status}\n"
            f"  Updated: {updated_task.updated_at.strftime('%Y-%m-%d %H:%M')}"
        )
    else:
        display_error("Failed to update task status.")

    input("\nPress Enter to return to menu...")
