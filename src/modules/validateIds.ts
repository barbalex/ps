/**
 * Validates that IDs are not undefined before they're used in URLs or navigation.
 * Throws an error with a helpful message if any ID is undefined.
 *
 * @param ids - Object mapping ID names to their values
 * @throws Error if any ID is undefined
 *
 * @example
 * validateIds({ projectId, wmsLayerId })
 */
export const validateIds = (ids: Record<string, unknown>): void => {
  const undefinedIds = Object.entries(ids)
    .filter(([_, value]) => value === undefined)
    .map(([key]) => key)

  if (undefinedIds.length > 0) {
    throw new Error(
      `Navigation error: The following IDs are undefined: ${undefinedIds.join(', ')}. ` +
        `This likely indicates a bug where navigation is being attempted before required IDs are available. ` +
        `Check the component that triggered this navigation.`,
    )
  }
}

/**
 * Validates a single ID before it's used in a URL or navigation.
 * Throws an error with a helpful message if the ID is undefined.
 *
 * @param id - The ID value to validate
 * @param idName - The name of the ID (for error messages)
 * @throws Error if the ID is undefined
 *
 * @example
 * validateId(projectId, 'projectId')
 */
export const validateId = (id: unknown, idName: string): void => {
  if (id === undefined) {
    throw new Error(
      `Navigation error: ${idName} is undefined. ` +
        `This likely indicates a bug where navigation is being attempted before ${idName} is available. ` +
        `Check the component that triggered this navigation.`,
    )
  }
}
