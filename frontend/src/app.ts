// Drag and drop interfaces
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

function* idMaker() {
  let index = 0;
  while (true) yield index++;
}

const idGenerator = idMaker();

type ProjectStatus = "active" | "finished";

class Project {
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

type Listener<T> = (projects: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listener: Listener<T>) {
    this.listeners.push(listener);
  }
}

class ProjectState extends State<Project> {
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

interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(toValidate: Validatable): boolean {
  let isValid = true;
  if (toValidate.required) {
    isValid = isValid && toValidate.value.toString().trim().length !== 0;
  }
  if (toValidate.minLength != null && typeof toValidate.value === "string") {
    isValid =
      isValid &&
      toValidate.value.toString().trim().length >= toValidate.minLength;
  }
  if (toValidate.maxLength != null && typeof toValidate.value === "string") {
    isValid =
      isValid &&
      toValidate.value.toString().trim().length <= toValidate.maxLength;
  }
  if (toValidate.min != null && typeof toValidate.value === "number") {
    isValid = isValid && toValidate.value >= toValidate.min;
  }
  if (toValidate.max != null && typeof toValidate.value === "number") {
    isValid = isValid && toValidate.value <= toValidate.max;
  }
  return isValid;
}

function AutoBind(
  _target: any,
  _name: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  const originalMethod = descriptor.value;
  return {
    configurable: true,
    enumerable: false,
    get() {
      return originalMethod.bind(this);
    },
  };
}

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  private templateElm: HTMLTemplateElement;
  private hostElm: T;
  element: U;

  constructor(
    templateId: string,
    hostId: string,
    insertPosition: InsertPosition,
    elementId?: string
  ) {
    this.templateElm = document.querySelector(`#${templateId}`)!;
    this.hostElm = document.querySelector(`#${hostId}`)!;

    const importedNode = document.importNode(this.templateElm.content, true);

    this.element = importedNode.firstElementChild! as U;

    if (elementId) this.element.id = elementId;

    this.hostElm.insertAdjacentElement(insertPosition, this.element!);
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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

class ProjectItem
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

class ProjectList
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

new ProjectInput();
new ProjectList("active");
new ProjectList("finished");
