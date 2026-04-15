export interface SnapWithValues {
  id: string;
  journeyId: string;
  date: string;
  createdAt: Date;
  updatedAt: Date | null;
  values: {
    id: string;
    snapId: string;
    stepDefinitionId: string;
    numericValue: string | null;
    textValue: string | null;
    stepDefinition: {
      id: string;
      name: string;
      type: "numeric" | "text";
      isPredefined: boolean;
      sortOrder: number;
      isActive: boolean;
    };
  }[];
}
