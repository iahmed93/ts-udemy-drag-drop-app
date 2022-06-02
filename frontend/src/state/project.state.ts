import { Project, ProjectStatus } from "../model/index";
import { State } from "./base.state";

export class ProjectState extends State<Project> {
  projects: Project[] = [];

  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    this.instance = this.instance ?? new ProjectState();
    return this.instance;
  }

  addProject(project: Project) {
    this.projects.push(project);
    this.updateListeners();
  }

  moveProject(id: number, status: ProjectStatus) {
    const project = this.projects.find((p) => p.id === id);
    if (project && project.status !== status) {
      project.status = status;
      this.updateListeners();
    }
  }

  private updateListeners() {
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}
