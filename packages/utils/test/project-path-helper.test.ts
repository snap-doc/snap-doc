import { expect } from 'chai';
import { suite, test } from 'mocha-typescript';
import { join, relative } from 'path';
import ProjectPathHelper from '../src/project-path-helper';

@suite
export class ProjectPathHelperTests {
  @test public 'basic use w/o main'() {
    const h = new ProjectPathHelper(
      {
        path: '/foo/bar/baz',
        name: 'my-pkg'
      },
      { combinePaths: join, pathRelativeTo: relative }
    );
    expect(h.pathForSlug('module', 'src/abc')).to.eq('src/abc');
  }
  @test public 'basic use w/ main'() {
    const h = new ProjectPathHelper(
      {
        path: '/foo/bar/baz',
        name: 'my-pkg',
        main: 'src/index'
      },
      { combinePaths: join, pathRelativeTo: relative }
    );
    expect(h.pathForSlug('module', 'src/abc')).to.eq('abc');
    expect(h.pathForSlug('module', 'src/index')).to.eq('index');
    expect(h.pathForSlug('module', 'src/utils/string')).to.eq('utils/string');
  }
}
