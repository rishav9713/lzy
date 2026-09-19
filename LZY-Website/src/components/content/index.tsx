/**
 * Components a Markdown document can ask for with
 * `<!-- lzy:component name -->`. They show data generated from the
 * interpreter, so the tables in the documentation cannot fall out of date.
 * An unknown name fails the build.
 */
import type { ComponentType } from 'react';

import { InstallCommands } from '../install/InstallCommands';
import { CliExitCodes, CliHelp, CliOptions, CliReference, VersionCheck } from './cli';
import {
  ArchitectureDiagram,
  ContributionFlow,
  LicenseSummary,
  ModuleTable,
  PlatformMatrix,
  ProjectNumbers,
  SecuritySummary,
} from './project';
import { BuiltinsTable, ErrorKinds, KeywordsList, LimitsTable, ReservedWords } from './reference';
import { ReplHelp, ReplSession } from './repl';

export const contentComponents: Record<string, ComponentType> = {
  'install-commands': InstallCommands,
  'version-check': VersionCheck,
  'cli-reference': CliReference,
  'cli-options': CliOptions,
  'cli-help': CliHelp,
  'cli-exit-codes': CliExitCodes,
  'repl-session': ReplSession,
  'repl-help': ReplHelp,
  'builtins-table': BuiltinsTable,
  keywords: KeywordsList,
  'reserved-words': ReservedWords,
  'error-kinds': ErrorKinds,
  'limits-table': LimitsTable,
  'contribution-flow': ContributionFlow,
  'security-summary': SecuritySummary,
  'license-summary': LicenseSummary,
  'architecture-diagram': ArchitectureDiagram,
  'module-table': ModuleTable,
  'platform-matrix': PlatformMatrix,
  'project-numbers': ProjectNumbers,
};
