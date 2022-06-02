import { AutoBind } from "../decorator/index";
import { Project } from "../model/index";
import { ProjectState } from "../state/index";
import { Component } from "./index";
import { validate } from "../util/index";

export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  private titleInputElm: HTMLInputElement;
  private descriptionInputElm: HTMLInputElement;
  private peopleInputElm: HTMLInputElement;

  constructor() {
    super("project-input", "app", "afterbegin", "user-input");
    this.titleInputElm = this.element.querySelector("#title")!;
    this.descriptionInputElm = this.element.querySelector("#description")!;
    this.peopleInputElm = this.element.querySelector("#people")!;
    this.configure();
  }

  configure(): void {
    this.element.addEventListener("submit", this.handleSubmit);
  }

  @AutoBind
  private handleSubmit(event: Event) {
    event.preventDefault();
    const project = this.getAndValidateInput();
    if (project) {
      console.log(project);
      ProjectState.getInstance().addProject(project);
      this.clearInput();
    }
  }

  private clearInput() {
    this.titleInputElm.value = "";
    this.descriptionInputElm.value = "";
    this.peopleInputElm.value = "";
  }

  private getAndValidateInput(): Project | void {
    const title = this.titleInputElm.value;
    const description = this.descriptionInputElm.value;
    const people = +this.peopleInputElm.value;

    const titleValidatable = { value: title, required: true };
    const descriptionValidatable = {
      value: description,
      required: true,
      minLength: 5,
    };
    const peopleValidatable = {
      value: people,
      required: true,
      min: 0,
      max: 10,
    };

    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert("Please enter valid input!");
      return;
    }
    return new Project(title, description, people);
  }

  renderContent(): void {}
}
