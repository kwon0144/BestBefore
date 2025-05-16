export type DailySchedule = {
    is_open: boolean;
    hours: string | null;
};

export type OperationSchedule = {
    is_24_hours: boolean;
    days: string[];
    hours: string;
    raw_text: string;
    daily_schedule: {
        monday: DailySchedule;
        tuesday: DailySchedule;
        wednesday: DailySchedule;
        thursday: DailySchedule;
        friday: DailySchedule;
        saturday: DailySchedule;
        sunday: DailySchedule;
    };
};

export type Foodbank = {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    type: string;
    hours_of_operation: string;
    address: string;
    operation_schedule: OperationSchedule;
};

export type FoodbankResponse = {
    status: string;
    count: number;
    data: Foodbank[];
};