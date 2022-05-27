import { AutoBind } from "../decorator/index.js";
import { Draggable, Project } from "../model/index.js";
import { Component } from "./index.js";

export class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  private project: Project;

  get persons() {
    if (this.project.people > 1) {
      return `${this.project.people} persons`;
    } else {
      return "1 person";
    }
  }

  constructor(hostId: string, project: Project) {
    super("single-project", hostId, "beforeend", project.id.toString());
    this.project = project;
    this.configure();
    this.renderContent();
  }

  @AutoBind
  dragStartHandler(_event: DragEvent): void {
    _event.dataTransfer!.setData("text/plain", this.project.id.toString());
    _event.dataTransfer!.effectAllowed = "move";
  }
  dragEndHandler(_event: DragEvent): void {
    console.log("drag end");
  }

  configure(): void {
    this.element.addEventListener("dragstart", this.dragStartHandler);
    this.element.addEventListener("dragend", this.dragEndHandler);
  }

  renderContent() {
    this.element.querySelector("h2")!.textContent = this.project.title;
    this.element.querySelector("h3")!.textContent = this.persons;
    this.element.querySelector("p")!.textContent = this.project.description;
  }
}
