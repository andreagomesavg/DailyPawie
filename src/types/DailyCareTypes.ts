export interface Feeding {

  foodType?: string;

  dailyQuantity?: string;

  frequency?: string;

  specialNeeds?: string;

}



export interface Hygiene {

  bathFrequency?: string;

  brushFrequency?: string;

  dentalCleaningFrequency?: string;

  cleaningEars?: string;

  cuttingNails?: string;

  notes?: string;

}



export interface Exercise {

  excerciseType?: string;

  duration?: string;

  frequency?: string;

  observations?: string;

}



export interface DailyCare {

  feeding?: Feeding;

  hygiene?: Hygiene;

  exercise?: Exercise;

}
