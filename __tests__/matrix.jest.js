// @flow

import { range } from '../src/matrix';
import * as Types from '../src/types';

describe("Matrix:", () => {
	test("basic use of range method", () => {
		const startPoint = { row: 1, column: 1 };
		const endPoint = { row: 5, column: 5 };

		const res = range(
			endPoint: Types.Point,
			startPoint: Types.Point
		);

		console.log('array:', res);

	});
})