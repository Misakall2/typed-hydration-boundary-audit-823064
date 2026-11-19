import 'reflect-metadata';
import { instanceToPlain, plainToInstance } from '../../src/index';
import { defaultMetadataStorage } from '../../src/storage';
import { Exclude, Expose, Transform, Type } from '../../src/decorators';

describe('filtering by transformation option', () => {
  it('@Exclude with toPlainOnly set to true then it should be excluded only during instanceToPlain and classToPlainFromExist operations', () => {
    defaultMetadataStorage.clear();

    class User {
      id: number;
      firstName: string;
      lastName: string;

      @Exclude({ toPlainOnly: true })
      password: string;
    }

    const user = new User();
    user.firstName = 'Umed';
    user.lastName = 'Khudoiberdiev';
    user.password = 'imnosuperman';

    const plainUser = {
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
    };

    const plainedUser = instanceToPlain(user);
    expect(plainedUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
    });

    const classedUser = plainToInstance(User, plainUser);
    expect(classedUser).toBeInstanceOf(User);
    expect(classedUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
    });
  });

  it('@Exclude with toClassOnly set to true then it should be excluded only during plainToInstance and plainToClassFromExist operations', () => {
    defaultMetadataStorage.clear();

    class User {
      id: number;
      firstName: string;
      lastName: string;

      @Exclude({ toClassOnly: true })
      password: string;
    }

    const user = new User();
    user.firstName = 'Umed';
    user.lastName = 'Khudoiberdiev';
    user.password = 'imnosuperman';

    const plainUser = {
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
    };

    const classedUser = plainToInstance(User, plainUser);
    expect(classedUser).toBeInstanceOf(User);
    expect(classedUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
    });

    const plainedUser = instanceToPlain(user);
    expect(plainedUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
    });
  });

  it('@Expose with toClassOnly set to true then it should be excluded only during instanceToPlain and classToPlainFromExist operations', () => {
    defaultMetadataStorage.clear();

    @Exclude()
    class User {
      @Expose()
      firstName: string;

      @Expose()
      lastName: string;

      @Expose({ toClassOnly: true })
      password: string;
    }

    const user = new User();
    user.firstName = 'Umed';
    user.lastName = 'Khudoiberdiev';
    user.password = 'imnosuperman';

    const plainUser = {
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
    };

    const plainedUser = instanceToPlain(user);
    expect(plainedUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
    });

    const classedUser = plainToInstance(User, plainUser);
    expect(classedUser).toBeInstanceOf(User);
    expect(classedUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
    });
  });

  it('@Expose with toPlainOnly set to true then it should be excluded only during instanceToPlain and classToPlainFromExist operations', () => {
    defaultMetadataStorage.clear();

    @Exclude()
    class User {
      @Expose()
      firstName: string;

      @Expose()
      lastName: string;

      @Expose({ toPlainOnly: true })
      password: string;
    }

    const user = new User();
    user.firstName = 'Umed';
    user.lastName = 'Khudoiberdiev';
    user.password = 'imnosuperman';

    const plainUser = {
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
    };

    const plainedUser = instanceToPlain(user);
    expect(plainedUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
      password: 'imnosuperman',
    });

    const classedUser = plainToInstance(User, plainUser);
    expect(classedUser).toBeInstanceOf(User);
    expect(classedUser).toEqual({
      firstName: 'Umed',
      lastName: 'Khudoiberdiev',
    });
  });

  it('should ignore undefined properties when exposeUnsetFields is set to false during class to plain', () => {
    defaultMetadataStorage.clear();

    @Exclude()
    class User {
      @Expose()
      firstName: string;

      @Expose()
      lastName: string;
    }

    expect(instanceToPlain(new User(), { exposeUnsetFields: false })).toEqual({});
    expect(instanceToPlain(new User(), { exposeUnsetFields: true })).toEqual({
      firstName: undefined,
      lastName: undefined,
    });

    const classedUser = plainToInstance(User, { exposeUnsetFields: false });
    expect(classedUser).toBeInstanceOf(User);
    expect(classedUser).toEqual({
      firstName: undefined,
      lastName: undefined,
    });
  });

  describe('audience projection', () => {
    // Fictional approval workflow data shared by the internal and the public
    // projections. Only two nested, fully declared sample classes plus the
    // request class are used.
    const internalTransformCalls: Array<{ key: string; value: any }> = [];
    const publicTransformCalls: Array<{ key: string; value: any }> = [];

    let ContactInfo: any;
    let ApprovalAttachment: any;
    let DocumentAttachment: any;
    let NoteAttachment: any;
    let ExternalSummary: any;
    let ApprovalRequest: any;

    beforeAll(() => {
      defaultMetadataStorage.clear();

      ContactInfo = class {
        // public alias, also visible internally under the original property name
        telephone: string;

        // internal only: never declared for the public audience
        extension: string;

        // null value must be kept in the public view
        email: string | null;

        // public field produced through an audience-declared custom transform
        contactable: string;
      };
      Expose({ name: 'phone', audiences: ['public'] })(ContactInfo.prototype, 'telephone');
      Expose({ name: 'emailAddress', audiences: ['public'] })(ContactInfo.prototype, 'email');
      Expose({ name: 'reachable', audiences: ['public'] })(ContactInfo.prototype, 'contactable');
      Transform(({ value }) => {
        publicTransformCalls.push({ key: 'contactable', value });
        return value === 'yes';
      }, { audiences: ['public'] })(ContactInfo.prototype, 'contactable');

      ApprovalAttachment = class {
        kind: string;
        label: string;
      };
      // the discriminator property itself needs an audience declaration, it
      // does not bypass the projection either
      Expose({ audiences: ['public'] })(ApprovalAttachment.prototype, 'kind');

      // first kind of attachment: one public alias plus an internal field
      DocumentAttachment = class extends ApprovalAttachment {
        documentCode: string;
        internalRemarks: string;
      };
      Expose({ name: 'docCode', audiences: ['public'] })(DocumentAttachment.prototype, 'documentCode');

      // second kind of attachment: deliberately no public declaration at all
      NoteAttachment = class extends ApprovalAttachment {
        noteText: string;
      };

      ExternalSummary = class {
        text: string;

        // internal field carried on the object returned by a custom transform:
        // the nested object has to be projected on its own declaration
        internalDigest: string;
      };
      Expose({ name: 'summaryText', audiences: ['public'] })(ExternalSummary.prototype, 'text');

      ApprovalRequest = class {
        // public alias is declared on the property below via @Expose
        id: number;

        // internal remark, no audience declaration
        remark: string;

        // internal contact info (nested object has its own declarations)
        contact: any;

        // polymorphic array mixing two attachment kinds
        attachments: any[];

        // available in the public view only up to (not including) version 2
        oldToken: string;

        // available in the public view only from version 2
        newToken: string;

        // internal field whose alias collides with a public field below:
        // same output name does not make it selectable for the public audience
        internalShared: string;

        publicShared: string;

        // custom transform on an internal-only property: its callback must
        // never run during a public projection
        internalCode: string;

        // custom transform returning an already-authorized value: allowed, but
        // the returned object is still projected against its own declaration
        externalSummary: any;
      };
      Expose({ name: 'requestId', audiences: ['public'] })(ApprovalRequest.prototype, 'id');
      Expose({ name: 'legacyToken', audiences: ['public'], until: 2 })(
        ApprovalRequest.prototype,
        'oldToken'
      );
      Expose({ name: 'freshToken', audiences: ['public'], since: 2 })(
        ApprovalRequest.prototype,
        'newToken'
      );
      Expose({ name: 'sharedAlias' })(ApprovalRequest.prototype, 'internalShared');
      Expose({ name: 'sharedAlias', audiences: ['public'] })(ApprovalRequest.prototype, 'publicShared');
      Transform(({ key, value }) => {
        internalTransformCalls.push({ key, value });
        return 'internal:' + String(value);
      })(ApprovalRequest.prototype, 'internalCode');
      Expose({ name: 'external', audiences: ['public'] })(ApprovalRequest.prototype, 'externalSummary');
      Transform(({ value }) => value, { audiences: ['public'] })(
        ApprovalRequest.prototype,
        'externalSummary'
      );
      // nested objects need their own audience declaration: the parent does
      // not implicitly authorize its child objects' fields
      Expose({ audiences: ['public'] })(ApprovalRequest.prototype, 'contact');
      Type(() => ContactInfo)(ApprovalRequest.prototype, 'contact');
      Expose({ audiences: ['public'] })(ApprovalRequest.prototype, 'attachments');
      Type(() => ExternalSummary)(ApprovalRequest.prototype, 'externalSummary');
      Type(() => ApprovalAttachment, {
        discriminator: {
          property: 'kind',
          subTypes: [
            { value: DocumentAttachment, name: 'document' },
            { value: NoteAttachment, name: 'note' },
          ],
        },
      })(ApprovalRequest.prototype, 'attachments');
    });

    beforeEach(() => {
      internalTransformCalls.length = 0;
      publicTransformCalls.length = 0;
    });

    function buildApprovalRequest(): any {
      const request = new ApprovalRequest();
      request.id = 42;
      request.remark = 'approve after manager review';
      request.internalCode = 'CODE-7';
      request.oldToken = 'legacy-1';
      request.newToken = 'fresh-2';
      request.internalShared = 'internal-value';
      request.publicShared = 'public-value';

      const contact = new ContactInfo();
      contact.telephone = '+1-555-0100';
      contact.extension = 'x202';
      contact.email = null;
      contact.contactable = 'yes';
      request.contact = contact;

      const document = new DocumentAttachment();
      document.kind = 'document';
      document.label = 'contract.pdf';
      document.documentCode = 'DOC-1';
      document.internalRemarks = 'do not leak';

      const note = new NoteAttachment();
      note.kind = 'note';
      note.label = 'review note';
      note.noteText = 'sensitive reviewer note';

      request.attachments = [document, note];

      const summary = new ExternalSummary();
      summary.text = 'clean public summary';
      summary.internalDigest = 'digest-secret';
      request.externalSummary = summary;

      return request;
    }

    it('should keep the original internal convention when no audience is requested', () => {
      const request = buildApprovalRequest();
      const snapshot = JSON.parse(JSON.stringify(request));

      const internal: any = instanceToPlain(request);

      // full property set comparison, not just a property count
      expect(Object.keys(internal).sort()).toEqual(
        [
          'requestId',
          'remark',
          'contact',
          'attachments',
          'legacyToken',
          'freshToken',
          'sharedAlias',
          'internalCode',
          'external',
        ].sort()
      );
      // internal remarks and contact details stay available
      expect(internal.remark).toBe('approve after manager review');
      expect(internal.contact.extension).toBe('x202');
      expect(internal.attachments[0].internalRemarks).toBe('do not leak');
      expect(internal.attachments[1].noteText).toBe('sensitive reviewer note');
      // custom transform on the internal field runs without audience opt-in
      expect(internal.internalCode).toBe('internal:CODE-7');
      expect(internalTransformCalls).toEqual([{ key: 'internalCode', value: 'CODE-7' }]);
      // aliases are still applied as before
      expect(internal).not.toHaveProperty('id');
      expect(internal.requestId).toBe(42);
      // input object is not modified
      expect(request).toEqual(snapshot);
    });

    it('should project every nested object on its own declaration for the public audience', () => {
      const request = buildApprovalRequest();
      const snapshot = JSON.parse(JSON.stringify(request));

      const publicPlain: any = instanceToPlain(request, { audience: 'public', version: 1 });

      // outer level: complete property set, including the public alias
      expect(Object.keys(publicPlain).sort()).toEqual(
        ['requestId', 'contact', 'attachments', 'legacyToken', 'sharedAlias', 'external'].sort()
      );
      expect(publicPlain.requestId).toBe(42);
      // internal fields are absent regardless of naming collisions
      expect(publicPlain).not.toHaveProperty('remark');
      expect(publicPlain).not.toHaveProperty('internalCode');
      expect(publicPlain).not.toHaveProperty('id');
      // the public alias resolves to the audience-declared property only
      expect(publicPlain.sharedAlias).toBe('public-value');
      // version boundary: since 2 is not active at version 1
      expect(publicPlain).not.toHaveProperty('freshToken');
      // null values and declared aliases are preserved
      expect(publicPlain.contact.emailAddress).toBeNull();
      expect(publicPlain.contact.phone).toBe('+1-555-0100');

      // nested object is filtered against ContactInfo's own declaration:
      // the parent allowing the `contact` property does not authorize all of
      // its fields
      expect(Object.keys(publicPlain.contact).sort()).toEqual(
        ['phone', 'emailAddress', 'reachable'].sort()
      );
      expect(publicPlain.contact).not.toHaveProperty('extension');
      expect(publicPlain.contact.reachable).toBe(true);
      expect(publicTransformCalls).toEqual([{ key: 'contactable', value: 'yes' }]);

      // first attachment kind keeps its own public alias only
      expect(publicPlain.attachments[0].kind).toBe('document');
      expect(publicPlain.attachments[0].docCode).toBe('DOC-1');
      expect(publicPlain.attachments[0]).not.toHaveProperty('internalRemarks');
      expect(publicPlain.attachments[0]).not.toHaveProperty('documentCode');

      // second attachment kind has no public declaration and must not inherit
      // the first kind's public allowlist, nor expose its own internal field
      expect(publicPlain.attachments[1]).toEqual({ kind: 'note' });
      expect(publicPlain.attachments[1]).not.toHaveProperty('noteText');
      expect(publicPlain.attachments[1]).not.toHaveProperty('docCode');

      // object returned by a custom transform is re-projected: authorized
      // value survives, internal fields on it do not
      expect(publicPlain.external.summaryText).toBe('clean public summary');
      expect(publicPlain.external).not.toHaveProperty('internalDigest');

      // rejected fields never reach a custom transform callback
      expect(internalTransformCalls).toHaveLength(0);

      // input object remains untouched
      expect(request).toEqual(snapshot);
    });

    it('should combine audience and version restrictions instead of applying either one alone', () => {
      const request = buildApprovalRequest();

      const atVersion1: any = instanceToPlain(request, { audience: 'public', version: 1 });
      expect(atVersion1.legacyToken).toBe('legacy-1');
      expect(atVersion1).not.toHaveProperty('freshToken');

      const atVersion2: any = instanceToPlain(request, { audience: 'public', version: 2 });
      expect(atVersion2).not.toHaveProperty('legacyToken');
      expect(atVersion2.freshToken).toBe('fresh-2');

      // audience requirement still applies at the new version boundary
      expect(atVersion2).not.toHaveProperty('remark');
      expect(Object.keys(atVersion2).sort()).toEqual(
        ['requestId', 'contact', 'attachments', 'freshToken', 'sharedAlias', 'external'].sort()
      );
    });

    it('should not leak the audience into later transformations without an audience', () => {
      const request = buildApprovalRequest();

      // a public projection first
      const publicPlain: any = instanceToPlain(request, { audience: 'public' });
      expect(publicPlain).not.toHaveProperty('remark');
      expect(internalTransformCalls).toHaveLength(0);

      // switching back to an internal transformation restores every legal
      // field: the audience is a per-call option, not a global default
      const internalAgain: any = instanceToPlain(request);
      expect(internalAgain.remark).toBe('approve after manager review');
      expect(internalAgain.internalCode).toBe('internal:CODE-7');
      expect(internalAgain.contact.extension).toBe('x202');
      expect(internalAgain.attachments[1].noteText).toBe('sensitive reviewer note');
      expect(internalAgain.external.internalDigest).toBe('digest-secret');
      expect(internalTransformCalls).toEqual([{ key: 'internalCode', value: 'CODE-7' }]);
    });
  });

  describe('audience projection without a declared nested target', () => {
    it('should not leak fields of nested objects without a declared target type', () => {
      defaultMetadataStorage.clear();

      class UntypedHolder {
        @Expose({ audiences: ['public'] })
        @Type(() => Object)
        bag: any;
      }

      const holder = new UntypedHolder();
      holder.bag = { secret: 'x', visible: 1 };

      const publicPlain: any = instanceToPlain(holder, { audience: 'public' });
      // a plain object cannot prove any property declaration, so none of its
      // fields are authorized for the public projection
      expect(publicPlain.bag).toEqual({});

      // the same defensive rule applies at the top level when no class target
      // can be resolved for a plain object
      const topLevelPlain: any = instanceToPlain({ secret: 'x', kept: 1 }, { audience: 'public' });
      expect(topLevelPlain).toEqual({});
    });
  });
});
