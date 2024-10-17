interface UserState {
  nextQuestionId: number;
  isAttendHolmat: boolean;
  nRSVPHolMat: number;
  isAttendDinner: boolean;
  nRSVPDinner: number;
  dinnerNames: string[];
}

class UserMessage {
  private state: UserState;

  constructor() {
    this.state = {
      nextQuestionId: 0,
      isAttendHolmat: false,
      nRSVPHolMat: 0,
      isAttendDinner: false,
      nRSVPDinner: 0,
      dinnerNames: [],
    };
  }

  public getNextQuestionId(): number {
    return this.state.nextQuestionId;
  }

  public setNextQuestionId(id: number): void {
    this.state.nextQuestionId = id;
  }

  public getIsAttendHolmat(): boolean {
    return this.state.isAttendHolmat;
  }

  public setIsAttendHolmat(isAttend: boolean): void {
    this.state.isAttendHolmat = isAttend;
  }

  public getNRsvpHolmat(): number {
    return this.state.nRSVPHolMat;
  }

  public setNRsvpHolmat(n_rsvp_holmat: number): void {
    this.state.nRSVPHolMat = n_rsvp_holmat;
  }

  public getIsAttendDinner(): boolean {
    return this.state.isAttendDinner;
  }

  public setIsAttendDinner(isAttend: boolean): void {
    this.state.isAttendDinner = isAttend;
  }

  public getNRsvpDinner(): number {
    return this.state.nRSVPDinner;
  }

  public setNRsvpDinner(n_rsvp_wedcer: number): void {
    this.state.nRSVPDinner = n_rsvp_wedcer;
  }

  public getDinnerNames(): string[] {
    return this.state.dinnerNames;
  }

  public setDinnerNames(wedcer_names: string[]): void {
    this.state.dinnerNames = wedcer_names;
  }

  public reset(): void {
    this.state = {
      nextQuestionId: 0,
      isAttendHolmat: false,
      nRSVPHolMat: 0,
      isAttendDinner: false,
      nRSVPDinner: 0,
      dinnerNames: [],
    };
  }

  public getState(): UserState {
    return this.state;
  }
}

export default UserMessage;
