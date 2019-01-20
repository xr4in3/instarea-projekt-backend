const request = require("supertest");
const expect = require("expect");
const app = require("../server").app
const mongoose = require("mongoose");

mongoose.Promise = global.Promise
mongoose.connect("mongodb://admin:admin1@ds029454.mlab.com:29454/notes-api", { useNewUrlParser: true })
const Categories = mongoose.model('categories')
let testId = "5c4220764425fa14dcc14b7a"


describe( "db is not empty", () => {
    it("should check if DB is not empty", (done) => {
        Categories.find().then((doc) => {expect(doc.length).toBeGreaterThan(0)}).end(done())

    })
}) 


describe('GET api/categories', () => {
    it('should fetch last one doc of categories', (done) => {
        request(app).get("/api/categories").expect(200).expect((response) => {expect(response.body.length).toBe(1)}).end(done())
        
    });

});

describe('GET api/venues', () => {
    it('should fetch all venues in db', (done) => {
        request(app).get("/api/venues").expect(200).expect((response) => {expect(response.body.length).toBeGreaterThanOrEqualTo(1); expect(response.body[0].name).toBe("Laser Arena")}).end(done())
    })
    
});

describe('GET api/venue/:id', () => {
    

    it('should fetch a venue with given id', (done) => {
        request(app).get(`/api/venue/${testId}`).expect(200).expect((response) => {expect(response.body.name).toExist()}).end(done())
    });
    it('should not fetch a venue with this id', (done) => {
        request(app).get(`/api/venue/${testId}2323`).expect(400).expect((response) => {expect(response.body.response).toBe("Invalid ID format!")}).end(done)
    });
  
});

describe("GET api/venues/search" , () => {
    it('should fetch venue by name', (done) => {
        request(app).get(`/api/venues/search?name="Laser Arena"`).expect(200).expect((response) => {expect(response.body.name).toBe("Laser Arena")}).end(done())
        
    });
    it('should fetch venues by rating', (done) => {
        request(app).get(`/api/venues/search?rating__gte=7`).expect(200).expect((response) => {expect(response.body.venues[0].rating).toBeGreaterThanOrEqualTo(7)}).end(done())
        
    });
    it('should fetch venues by price range', (done) => {
        request(app).get(`/api/venues/search?price__lte=1&price_gte=3`).expect(200).expect((response) => {expect(response.body.venues[0].rating).toBeGreaterThanOrEqualTo(1); expect(response.body.venues[0].rating).toBeLessThanOrEqualTo(3)}).end(done())
        
    });
    it('should fetch open venues', (done) => {
        request(app).get(`/api/venues/search?isOpen=true`).expect(200).expect((response) => {expect(response.body.venues[0].isOpen).toBe(true)}).end(done())
        
    });
    it("should not fetch venues with disallowed Qparams", (done) => {
        request(app).get(`/api/venues/search?likes__gte=5`).expect(400).expect((response) => {expect(response.body.response).toBe("Invalid query params")}).end(done())
    })
   
});
