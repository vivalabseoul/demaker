# Guidelines

This document contains design and development guidelines for the project.

## Design Guidelines

### UI Components

- Use shadcn/ui components as the base component library
- Maintain consistency with existing design patterns
- Follow mobile-first responsive design principles

### Colors

- Main color: `#10b981` (green)
- Sub color: `#3b82f6` (blue)
- Background: `#f9fafb` (light gray)
- Text: `#000000` (black) and `#666666` (gray)

### Typography

- Use system fonts: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto"`
- Headings: bold, appropriate sizes
- Body text: readable sizes, proper line height

## Development Guidelines

### Code Style

- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Keep components small and focused

### File Organization

- Components in `components/` directory
- Utilities in `utils/` directory
- Types in `types/` directory
- Styles in `styles/` directory

### Best Practices

- Always handle errors gracefully
- Provide loading states for async operations
- Use toast notifications for user feedback
- Optimize Firebase queries for performance

## Documentation

TIP: More context isn't always better. It can confuse the LLM. Try and add the most important rules you need

## Button Usage

Buttons should be used for important actions that users need to take, such as form submissions, confirming choices, and navigation. Use buttons consistently throughout the application to maintain a clear visual hierarchy and intuitive user experience.

* Primary Button
  * Purpose : Used for the most important action on a page or in a section
  * Usage : One primary button per section to guide users toward the most important action
  * Example : "Save", "Submit", "Confirm"
* Secondary Button
  * Purpose : Used for less important actions or alternatives
  * Usage : Can appear alongside a primary button for less important actions
  * Example : "Cancel", "Back"
* Ghost Button
  * Purpose : Used for the least important actions
  * Example : "Skip", "Dismiss"

