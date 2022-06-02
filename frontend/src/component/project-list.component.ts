import { AutoBind } from "../decorator/index";
import { DragTarget, ProjectStatus, Project } from "../model/index";
import { ProjectState } from "../state/index";
import { Component, ProjectItem } from "./index";

export class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  private assignedProjects: Project[] = [];
  private type: ProjectStatus = "active";

  constructor(type: ProjectStatus) {
    super("project-list", "app", "beforeend", `${type}-projects`);
    this.type = type;
    this.configure();
    this.renderContent();
  }

  @AutoBind
  dragOverHandler(_event: DragEvent): void {
    if (_event.dataTransfer && _event.dataTransfer.types[0] === "text/plain") {
      _event.preventDefault();
      const listElm = this.element.querySelector("ul");
      listElm?.classList.add("droppable");
    }
  }

  @AutoBind
  dropHandler(_event: DragEvent): void {
    console.log(_event.dataTransfer?.getData("text/plain"));
    const projectId = _event.dataTransfer?.getData("text/plain")!;
    ProjectState.getInstance().moveProject(+projectId, this.type);
  }

  @AutoBind
  dragLeaveHandler(_event: DragEvent): void {
    const listElm = this.element.querySelector("ul");
    listElm?.classList.remove("droppable");
  }

  configure(): void {
    this.element.addEventListener("dragover", this.dragOverHandler);
    this.element.addEventListener("drop", this.dropHandler);
    this.element.addEventListener("dragleave", this.dragLeaveHandler);

    ProjectState.getInstance().addListener((projects: Project[]) => {
      this.assignedProjects = projects.filter(
        (project) => project.status === this.type
      );
      this.renderProjects();
    });
  }

  renderProjects() {
    const listElm = document.getElementById(
      `${this.type}-projects-list`
    ) as HTMLUListElement;
    listElm.innerHTML = "";
    for (let project of this.assignedProjects) {
      new ProjectItem(`${this.type}-projects-list`, project);
    }
  }

  renderContent() {
    this.element.querySelector("ul")!.id = `${this.type}-projects-list`;
    this.element.querySelector(
      "h2"
    )!.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }
}
