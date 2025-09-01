import { Component } from '@angular/core';
import { Card } from '../components/card/card';
import { CommonModule } from '@angular/common';

interface Project {
  name: string;
  url: string;
  lastCommitMessage: string;
  lastCommitDate: string;
  branch: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [Card, CommonModule],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  yourProjects: Project[] = [
    {
      name: 'Project 1',
      url: 'https://github.com/repo1',
      lastCommitMessage: 'Initial commit',
      lastCommitDate: '2025-08-30',
      branch: 'main',
    },
    {
      name: 'Project 2',
      url: 'https://github.com/repo2',
      lastCommitMessage: 'Added feature',
      lastCommitDate: '2025-08-28',
      branch: 'dev',
    },
    {
      name: 'Project 3',
      url: 'https://github.com/repo3',
      lastCommitMessage: 'Bug fix',
      lastCommitDate: '2025-08-27',
      branch: 'main',
    },
    {
      name: 'Project 4',
      url: 'https://github.com/repo4',
      lastCommitMessage: 'Updated README',
      lastCommitDate: '2025-08-26',
      branch: 'main',
    },
  ];

  communityProjects: Project[] = [
    {
      name: 'Community 1',
      url: 'https://github.com/com1',
      lastCommitMessage: 'Init',
      lastCommitDate: '2025-08-25',
      branch: 'main',
    },
    {
      name: 'Community 2',
      url: 'https://github.com/com2',
      lastCommitMessage: 'Fix bug',
      lastCommitDate: '2025-08-24',
      branch: 'main',
    },
    {
      name: 'Community 3',
      url: 'https://github.com/com3',
      lastCommitMessage: 'Add docs',
      lastCommitDate: '2025-08-23',
      branch: 'main',
    },
    {
      name: 'Community 4',
      url: 'https://github.com/com3',
      lastCommitMessage: 'Add docs',
      lastCommitDate: '2025-08-23',
      branch: 'main',
    },
    {
      name: 'Community 5',
      url: 'https://github.com/com3',
      lastCommitMessage: 'Add docs',
      lastCommitDate: '2025-08-23',
      branch: 'main',
    },
    {
      name: 'Community 6',
      url: 'https://github.com/com3',
      lastCommitMessage: 'Add docs',
      lastCommitDate: '2025-08-23',
      branch: 'main',
    },
    {
      name: 'Community 7',
      url: 'https://github.com/com3',
      lastCommitMessage: 'Add docs',
      lastCommitDate: '2025-08-23',
      branch: 'main',
    },
  ];
}
