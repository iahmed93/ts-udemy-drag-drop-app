function* idMaker() {
  let index = 0;
  while (true) yield index++;
}

const idGenerator = idMaker();

export type ProjectStatus = "active" | "finished";

export class Project {
  id: number;
  status: ProjectStatus;
  constructor(
    public title: string,
    public description: string,
    public people: number
  ) {
    this.id = idGenerator.next().value as number;
    this.status = "active";
  }
}
