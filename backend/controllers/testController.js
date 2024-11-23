import Test from "../models/Test.js";
import User from "../models/User.js";
import Interview from "../models/Interview.js";

const getAllTestsForInterviewer = async (req, res) => {
  try {
    const interviewerUsername = req.params.interviewerUsername;
    const tests = await Test.find({ createdByUsername: interviewerUsername });
    if (!tests) return res.status(404).json({ message: "No tests found" });
    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const createTest = async (req, res) => {
  const { interviewType, time, specificRequirements, studentUsernames } =
    req.body;

  try {
    // Validate that all specified student usernames exist and have the "interviewee" role
    const students = await User.find({
      username: { $in: studentUsernames },
      role: "interviewee",
    });

    if (students.length !== studentUsernames.length) {
      // Identify missing usernames
      const foundUsernames = students.map((student) => student.username);
      const missingUsernames = studentUsernames.filter(
        (username) => !foundUsernames.includes(username)
      );

      return res.status(400).json({
        message: "Some student usernames were not found in the database",
        missingUsernames,
      });
    }

    // Create a new test with the updated schema
    const newTest = new Test({
      interviewType, // e.g., "frontend, backend, full stack"
      time, // Time in minutes
      specificRequirements,
      studentUsernames,
      createdByUsername: req.params.interviewerUsername,
    });

    await newTest.save();

    // Add the test ID to the interviewer's tests array
    await User.updateOne(
      { username: req.params.interviewerUsername },
      { $push: { tests: newTest._id } }
    );

    // Add the test ID to each interviewee's tests array
    await User.updateMany(
      { username: { $in: studentUsernames } },
      { $push: { tests: newTest._id } }
    );

    res.status(201).json({
      message: "Test created successfully and added to users",
      test: newTest,
    });
  } catch (error) {
    console.error("Error creating test:", error);
    res.status(500).json({ message: "Error creating test", error });
  }
};

const cancelTest = async (req, res) => {
  const { testId } = req.params;

  try {
    const test = await Test.findById(testId);
    if (!test) return res.status(404).json({ message: "Test not found" });

    await User.updateOne(
      { username: test.createdByUsername },
      { $pull: { tests: test._id } }
    );
    await User.updateMany(
      { username: { $in: test.studentUsernames } },
      { $pull: { tests: test._id } }
    );

    await Interview.deleteMany({ testId: test._id });
    console.log("works");
    await Test.findByIdAndDelete(testId);

    res.json({ message: "Test cancelled and deleted successfully" });
  } catch (error) {
    console.error("Error cancelling test:", error);
    res.status(500).json({ message: "Error cancelling test" });
  }
};

const getTestResults = async (req, res) => {
  try {
    const { testId } = req.params;

    // Fetch the test and validate
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    // Retrieve students for the test
    const students = await User.find({
      username: { $in: test.studentUsernames },
    });

    // Prepare result data for each student
    const results = await Promise.all(
      students.map(async (student) => {
        const interview = await Interview.findOne({
          testId,
          intervieweeId: student._id,
        });

        // Check if interview is completed
        return {
          username: student.username,
          completed: interview ? interview.completed : false,
          interviewId: interview && interview.completed ? interview._id : null,
        };
      })
    );

    res.status(200).json({ test, results });
  } catch (error) {
    console.error("Error fetching test results:", error);
    res.status(500).json({ message: "Error fetching test results" });
  }
};

const getAllTestsForInterviewee = async (req, res) => {
  try {
    const intervieweeUsername = req.params.intervieweeUsername;

    // Find the interviewee by username
    const interviewee = await User.findOne({
      username: intervieweeUsername,
      role: "interviewee",
    });
    if (!interviewee)
      return res.status(404).json({ message: "Interviewee not found" });

    // Get all tests for this interviewee
    const tests = await Test.find({ studentUsernames: intervieweeUsername });

    // Check completion status of each test
    const testStatuses = await Promise.all(
      tests.map(async (test) => {
        const interview = await Interview.findOne({
          testId: test._id,
          intervieweeId: interviewee._id,
        });
        return {
          test,
          completed: !!interview?.completed,
          resultPDF: interview?.resultPDF || null,
        };
      })
    );

    res.json({ testStatuses });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving tests", error });
  }
};

const getTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.testId);
    if (!test) return res.status(404).json({ message: "Test not found" });
    res.status(200).json(test);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export {
  getAllTestsForInterviewee,
  getTestResults,
  cancelTest,
  createTest,
  getAllTestsForInterviewer,
  getTest,
};
