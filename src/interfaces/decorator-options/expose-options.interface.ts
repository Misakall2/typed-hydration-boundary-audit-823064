/**
 * Possible transformation options for the @Expose decorator.
 */
export interface ExposeOptions {
  /**
   * Name of property on the target object to expose the value of this property.
   */
  name?: string;

  /**
   * First version where this property should be exposed.
   *
   * Example:
   * ```ts
   * instanceToPlain(payload, { version: 1.0 });
   * ```
   */
  since?: number;

  /**
   * Last version where this property should be exposed.
   *
   * Example:
   * ```ts
   * instanceToPlain(payload, { version: 1.0 });
   * ```
   */
  until?: number;

  /**
   * List of transformation groups this property belongs to. When set,
   * the property will be exposed only when transform is called with
   * one of the groups specified.
   *
   * Example:
   * ```ts
   * instanceToPlain(payload, { groups: ['user'] });
   * ```
   */
  groups?: string[];

  /**
   * List of audiences this property is declared for. When a transformation is
   * executed for a specific audience (for example the public `'public'`
   * audience), only properties whose declaration lists that audience are
   * candidates for the output. Properties without an audience declaration are
   * never selected for an audience-scoped transformation, even when they share
   * an exposed alias with an audience-declared property.
   *
   * Example:
   * ```ts
   * instanceToPlain(payload, { audience: 'public' });
   * ```
   */
  audiences?: string[];

  /**
   * Expose this property only when transforming from plain to class instance.
   */
  toClassOnly?: boolean;

  /**
   * Expose this property only when transforming from class instance to plain object.
   */
  toPlainOnly?: boolean;
}
