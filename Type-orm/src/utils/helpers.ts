/**
 * Helper function to generate a random inventory number
 * @param bookId The ID of the book
 * @param copyNumber The copy number
 */
export const generateInventoryNumber = (bookId: number, copyNumber: number): string => {
    return `${bookId.toString().padStart(5, '0')}-${copyNumber.toString().padStart(3, '0')}`;
  };
  
  /**
   * Helper function to calculate the due date
   * @param days Number of days until due (default: 14)
   */
  export const calculateDueDate = (days: number = 14): Date => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);
    return dueDate;
  };